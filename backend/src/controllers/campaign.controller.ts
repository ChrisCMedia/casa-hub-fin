import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, CampaignFilters } from '@/types/express';
import { createSuccessResponse, createPaginationResponse, getPaginationParams, asyncHandler } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { logger } from '@/config/logger';
import { CampaignType, CampaignStatus, UserRole } from '@prisma/client';

export class CampaignController {
  static getCampaigns = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, type, property, startDate, endDate } = req.query;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see campaigns they created
    if (req.user.role !== UserRole.ADMIN) {
      where.createdBy = req.user.id;
    }

    // Apply filters
    if (status) {
      where.status = status.toUpperCase() as CampaignStatus;
    }
    if (type) {
      where.type = type.toUpperCase() as CampaignType;
    }
    if (property) {
      where.propertyId = property;
    }
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          kpis: true,
          linkedInPosts: {
            select: {
              id: true,
              status: true,
              scheduledDate: true,
            },
          },
          _count: {
            select: {
              kpis: true,
              linkedInPosts: true,
            },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    // Calculate performance metrics for each campaign
    const campaignsWithMetrics = campaigns.map(campaign => {
      const performance = campaign.kpis.reduce((acc, kpi) => {
        if (kpi.target.toNumber() > 0) {
          acc.push((kpi.current.toNumber() / kpi.target.toNumber()) * 100);
        }
        return acc;
      }, [] as number[]);

      const avgPerformance = performance.length > 0 
        ? performance.reduce((sum, val) => sum + val, 0) / performance.length 
        : 0;

      return {
        ...campaign,
        performance: {
          average: Math.round(avgPerformance * 100) / 100,
          budgetUsed: (campaign.spent.toNumber() / campaign.budget.toNumber()) * 100,
        },
      };
    });

    res.json(createPaginationResponse(campaignsWithMetrics, total, page, limit));
  });

  static getCampaign = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            propertyImages: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        kpis: {
          include: {
            updater: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        linkedInPosts: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            analytics: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    // Check access permissions
    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Calculate performance metrics
    const performance = campaign.kpis.reduce((acc, kpi) => {
      if (kpi.target.toNumber() > 0) {
        acc.push((kpi.current.toNumber() / kpi.target.toNumber()) * 100);
      }
      return acc;
    }, [] as number[]);

    const avgPerformance = performance.length > 0 
      ? performance.reduce((sum, val) => sum + val, 0) / performance.length 
      : 0;

    const campaignWithMetrics = {
      ...campaign,
      performance: {
        average: Math.round(avgPerformance * 100) / 100,
        budgetUsed: (campaign.spent.toNumber() / campaign.budget.toNumber()) * 100,
        kpiAchievement: campaign.kpis.map(kpi => ({
          metric: kpi.metric,
          achievement: kpi.target.toNumber() > 0 ? (kpi.current.toNumber() / kpi.target.toNumber()) * 100 : 0,
        })),
      },
    };

    res.json(createSuccessResponse(campaignWithMetrics));
  });

  static createCampaign = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { 
      name, 
      propertyId, 
      type, 
      budget, 
      startDate, 
      endDate, 
      targetAudience, 
      platforms 
    } = req.body;

    // Validate property exists if provided
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        throw new AppError('Property not found', 400);
      }
      // Check if user can access the property
      if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
        throw new AppError('Access denied to this property', 403);
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        propertyId,
        type: type.toUpperCase() as CampaignType,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetAudience,
        platforms: platforms || [],
        createdBy: req.user.id,
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info('Campaign created', { campaignId: campaign.id, userId: req.user.id });

    res.status(201).json(createSuccessResponse(campaign, 'Campaign created successfully'));
  });

  static updateCampaign = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { 
      name, 
      propertyId, 
      type, 
      status,
      budget, 
      spent,
      startDate, 
      endDate, 
      targetAudience, 
      platforms 
    } = req.body;

    // Check if campaign exists and user has permission
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && existingCampaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate property exists if provided
    if (propertyId && propertyId !== existingCampaign.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        throw new AppError('Property not found', 400);
      }
      if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
        throw new AppError('Access denied to this property', 403);
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(propertyId !== undefined && { propertyId }),
        ...(type && { type: type.toUpperCase() as CampaignType }),
        ...(status && { status: status.toUpperCase() as CampaignStatus }),
        ...(budget && { budget: parseFloat(budget) }),
        ...(spent !== undefined && { spent: parseFloat(spent) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(platforms && { platforms }),
        updatedAt: new Date(),
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        kpis: true,
      },
    });

    logger.info('Campaign updated', { campaignId: campaign.id, userId: req.user.id });

    res.json(createSuccessResponse(campaign, 'Campaign updated successfully'));
  });

  static deleteCampaign = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    // Only creator or admin can delete
    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Only the creator or admin can delete this campaign', 403);
    }

    await prisma.campaign.delete({
      where: { id },
    });

    logger.info('Campaign deleted', { campaignId: id, userId: req.user.id });

    res.json(createSuccessResponse(null, 'Campaign deleted successfully'));
  });

  static addKPI = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { metric, target, unit } = req.body;

    // Check if campaign exists and user has permission
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const kpi = await prisma.campaignKPI.create({
      data: {
        campaignId: id,
        metric,
        target: parseFloat(target),
        unit,
        updatedBy: req.user.id,
      },
      include: {
        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(createSuccessResponse(kpi, 'KPI added successfully'));
  });

  static updateKPI = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id, kpiId } = req.params;
    const { metric, target, current, unit } = req.body;

    // Check if campaign exists and user has permission
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if KPI exists and belongs to this campaign
    const existingKPI = await prisma.campaignKPI.findUnique({
      where: { id: kpiId },
    });

    if (!existingKPI || existingKPI.campaignId !== id) {
      throw new AppError('KPI not found', 404);
    }

    const kpi = await prisma.campaignKPI.update({
      where: { id: kpiId },
      data: {
        ...(metric && { metric }),
        ...(target !== undefined && { target: parseFloat(target) }),
        ...(current !== undefined && { current: parseFloat(current) }),
        ...(unit && { unit }),
        updatedBy: req.user.id,
      },
      include: {
        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(createSuccessResponse(kpi, 'KPI updated successfully'));
  });

  static deleteKPI = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id, kpiId } = req.params;

    // Check if campaign exists and user has permission
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if KPI exists and belongs to this campaign
    const kpi = await prisma.campaignKPI.findUnique({
      where: { id: kpiId },
    });

    if (!kpi || kpi.campaignId !== id) {
      throw new AppError('KPI not found', 404);
    }

    await prisma.campaignKPI.delete({
      where: { id: kpiId },
    });

    res.json(createSuccessResponse(null, 'KPI deleted successfully'));
  });
}