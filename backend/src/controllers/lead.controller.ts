import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, LeadFilters } from '@/types/express';
import { createSuccessResponse, createPaginationResponse, getPaginationParams, asyncHandler, calculateScore } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { logger } from '@/config/logger';
import { LeadStatus, LeadSource, UserRole } from '@prisma/client';

export class LeadController {
  static getLeads = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, source, assignedAgent, minScore, maxScore } = req.query;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see their assigned leads
    if (req.user.role !== UserRole.ADMIN) {
      where.assignedAgent = req.user.id;
    }

    // Apply filters
    if (status) {
      where.status = status.toUpperCase() as LeadStatus;
    }
    if (source) {
      where.source = source.toUpperCase() as LeadSource;
    }
    if (assignedAgent) {
      where.assignedAgent = assignedAgent;
    }
    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = parseInt(minScore);
      if (maxScore) where.score.lte = parseInt(maxScore);
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          propertyInterests: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                  type: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json(createPaginationResponse(leads, total, page, limit));
  });

  static getLead = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        propertyInterests: {
          include: {
            property: {
              include: {
                propertyImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                agent: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check access permissions
    if (req.user.role !== UserRole.ADMIN && lead.assignedAgent !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json(createSuccessResponse(lead));
  });

  static createLead = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { 
      name, 
      email, 
      phone, 
      source, 
      budgetMin, 
      budgetMax, 
      notes,
      assignedAgent,
      propertyInterests 
    } = req.body;

    // Only admin can assign leads to other agents
    const finalAssignedAgent = req.user.role === UserRole.ADMIN && assignedAgent ? assignedAgent : req.user.id;

    // Validate assigned agent exists if provided
    if (assignedAgent && req.user.role === UserRole.ADMIN) {
      const agent = await prisma.user.findUnique({
        where: { id: assignedAgent },
      });
      if (!agent) {
        throw new AppError('Assigned agent not found', 400);
      }
    }

    // Calculate initial lead score
    const scoreFactors = {
      budget: budgetMin && budgetMax ? Math.min((budgetMin + budgetMax) / 2000000 * 100, 100) : 50,
      source: getSourceScore(source),
      profile: 70, // Default profile completeness
      engagement: 60, // Default engagement score
      timeline: 80, // Default timeline urgency
    };

    const score = calculateScore(scoreFactors);

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source: source.toUpperCase() as LeadSource,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        notes,
        score,
        assignedAgent: finalAssignedAgent,
        lastContact: new Date(),
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Add property interests if provided
    if (propertyInterests && propertyInterests.length > 0) {
      await prisma.leadProperty.createMany({
        data: propertyInterests.map((propertyId: string) => ({
          leadId: lead.id,
          propertyId,
          addedBy: req.user.id,
        })),
      });
    }

    logger.info('Lead created', { leadId: lead.id, userId: req.user.id });

    res.status(201).json(createSuccessResponse(lead, 'Lead created successfully'));
  });

  static updateLead = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      status,
      source, 
      budgetMin, 
      budgetMax, 
      notes,
      assignedAgent 
    } = req.body;

    // Check if lead exists and user has permission
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw new AppError('Lead not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && existingLead.assignedAgent !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate assigned agent exists if provided and user is admin
    if (assignedAgent && req.user.role === UserRole.ADMIN) {
      const agent = await prisma.user.findUnique({
        where: { id: assignedAgent },
      });
      if (!agent) {
        throw new AppError('Assigned agent not found', 400);
      }
    }

    // Recalculate score if relevant fields changed
    let newScore = existingLead.score;
    if (budgetMin !== undefined || budgetMax !== undefined || source) {
      const finalBudgetMin = budgetMin !== undefined ? budgetMin : existingLead.budgetMin?.toNumber();
      const finalBudgetMax = budgetMax !== undefined ? budgetMax : existingLead.budgetMax?.toNumber();
      
      const scoreFactors = {
        budget: finalBudgetMin && finalBudgetMax ? Math.min((finalBudgetMin + finalBudgetMax) / 2000000 * 100, 100) : 50,
        source: getSourceScore(source || existingLead.source),
        profile: 70,
        engagement: 60,
        timeline: 80,
      };
      newScore = calculateScore(scoreFactors);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { status: status.toUpperCase() as LeadStatus }),
        ...(source && { source: source.toUpperCase() as LeadSource }),
        ...(budgetMin !== undefined && { budgetMin: budgetMin ? parseFloat(budgetMin) : null }),
        ...(budgetMax !== undefined && { budgetMax: budgetMax ? parseFloat(budgetMax) : null }),
        ...(notes !== undefined && { notes }),
        ...(assignedAgent && req.user.role === UserRole.ADMIN && { assignedAgent }),
        score: newScore,
        lastContact: new Date(),
        updatedAt: new Date(),
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        propertyInterests: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                address: true,
                type: true,
                price: true,
              },
            },
          },
        },
      },
    });

    logger.info('Lead updated', { leadId: lead.id, userId: req.user.id });

    res.json(createSuccessResponse(lead, 'Lead updated successfully'));
  });

  static deleteLead = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Only assigned agent or admin can delete
    if (req.user.role !== UserRole.ADMIN && lead.assignedAgent !== req.user.id) {
      throw new AppError('Only the assigned agent or admin can delete this lead', 403);
    }

    await prisma.lead.delete({
      where: { id },
    });

    logger.info('Lead deleted', { leadId: id, userId: req.user.id });

    res.json(createSuccessResponse(null, 'Lead deleted successfully'));
  });

  static addPropertyInterest = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { propertyId } = req.body;

    // Check if lead exists and user has permission
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && lead.assignedAgent !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError('Property not found', 400);
    }

    // Check if interest already exists
    const existingInterest = await prisma.leadProperty.findUnique({
      where: {
        leadId_propertyId: {
          leadId: id,
          propertyId,
        },
      },
    });

    if (existingInterest) {
      throw new AppError('Property interest already exists', 409);
    }

    const interest = await prisma.leadProperty.create({
      data: {
        leadId: id,
        propertyId,
        addedBy: req.user.id,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            type: true,
            price: true,
          },
        },
      },
    });

    res.status(201).json(createSuccessResponse(interest, 'Property interest added successfully'));
  });

  static removePropertyInterest = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id, propertyId } = req.params;

    // Check if lead exists and user has permission
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && lead.assignedAgent !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if interest exists
    const interest = await prisma.leadProperty.findUnique({
      where: {
        leadId_propertyId: {
          leadId: id,
          propertyId,
        },
      },
    });

    if (!interest) {
      throw new AppError('Property interest not found', 404);
    }

    await prisma.leadProperty.delete({
      where: {
        leadId_propertyId: {
          leadId: id,
          propertyId,
        },
      },
    });

    res.json(createSuccessResponse(null, 'Property interest removed successfully'));
  });

  static updateScore = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { score, factors } = req.body;

    // Check if lead exists and user has permission
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && lead.assignedAgent !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Calculate new score from factors or use provided score
    const newScore = factors ? calculateScore(factors) : parseInt(score);

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        score: Math.max(0, Math.min(100, newScore)),
        updatedAt: new Date(),
      },
    });

    res.json(createSuccessResponse({ score: updatedLead.score }, 'Lead score updated successfully'));
  });
}

function getSourceScore(source: string): number {
  const sourceScores: Record<string, number> = {
    WEBSITE: 80,
    SOCIAL_MEDIA: 70,
    REFERRAL: 90,
    COLD_CALL: 50,
    EVENT: 85,
  };
  return sourceScores[source.toUpperCase()] || 60;
}