import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, PropertyFilters } from '@/types/express';
import { createSuccessResponse, createPaginationResponse, getPaginationParams, asyncHandler } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { logger } from '@/config/logger';
import { PropertyType, PropertyStatus, UserRole } from '@prisma/client';

export class PropertyController {
  static getProperties = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    const { type, status, minPrice, maxPrice, minArea, maxArea, agent } = req.query;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see their own properties
    if (req.user.role !== UserRole.ADMIN) {
      where.agentId = req.user.id;
    }

    // Apply filters
    if (type) {
      where.type = type.toUpperCase() as PropertyType;
    }
    if (status) {
      where.status = status.toUpperCase() as PropertyStatus;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }
    if (agent) {
      where.agentId = agent;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
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
          propertyImages: {
            orderBy: { sortOrder: 'asc' },
            take: 5,
          },
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              campaigns: true,
              leadProperties: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json(createPaginationResponse(properties, total, page, limit));
  });

  static getProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
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
        propertyImages: {
          orderBy: { sortOrder: 'asc' },
        },
        campaigns: {
          include: {
            kpis: true,
          },
        },
        leadProperties: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                score: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check access permissions
    if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json(createSuccessResponse(property));
  });

  static createProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { 
      title, 
      address, 
      type, 
      price, 
      area, 
      rooms, 
      description, 
      features, 
      listingDate,
      agentId 
    } = req.body;

    // Only admin can assign properties to other agents
    const finalAgentId = req.user.role === UserRole.ADMIN && agentId ? agentId : req.user.id;

    // Validate agent exists if provided
    if (agentId && req.user.role === UserRole.ADMIN) {
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new AppError('Agent not found', 400);
      }
    }

    const property = await prisma.property.create({
      data: {
        title,
        address,
        type: type.toUpperCase() as PropertyType,
        price: parseFloat(price),
        area: parseFloat(area),
        rooms: parseInt(rooms),
        description,
        features: features || [],
        listingDate: new Date(listingDate),
        agentId: finalAgentId,
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

    logger.info('Property created', { propertyId: property.id, userId: req.user.id });

    res.status(201).json(createSuccessResponse(property, 'Property created successfully'));
  });

  static updateProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { 
      title, 
      address, 
      type, 
      price, 
      area, 
      rooms, 
      status,
      description, 
      features, 
      listingDate,
      agentId 
    } = req.body;

    // Check if property exists and user has permission
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      throw new AppError('Property not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && existingProperty.agentId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate agent exists if provided and user is admin
    if (agentId && req.user.role === UserRole.ADMIN) {
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new AppError('Agent not found', 400);
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(address && { address }),
        ...(type && { type: type.toUpperCase() as PropertyType }),
        ...(price && { price: parseFloat(price) }),
        ...(area && { area: parseFloat(area) }),
        ...(rooms && { rooms: parseInt(rooms) }),
        ...(status && { status: status.toUpperCase() as PropertyStatus }),
        ...(description !== undefined && { description }),
        ...(features && { features }),
        ...(listingDate && { listingDate: new Date(listingDate) }),
        ...(agentId && req.user.role === UserRole.ADMIN && { agentId }),
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
        propertyImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    logger.info('Property updated', { propertyId: property.id, userId: req.user.id });

    res.json(createSuccessResponse(property, 'Property updated successfully'));
  });

  static deleteProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Only owner or admin can delete
    if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
      throw new AppError('Only the agent or admin can delete this property', 403);
    }

    await prisma.property.delete({
      where: { id },
    });

    logger.info('Property deleted', { propertyId: id, userId: req.user.id });

    res.json(createSuccessResponse(null, 'Property deleted successfully'));
  });

  static addImage = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { imageUrl, caption, isPrimary } = req.body;

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // If this is set as primary, update existing primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { 
          propertyId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    // Get the next sort order
    const lastImage = await prisma.propertyImage.findFirst({
      where: { propertyId: id },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    const image = await prisma.propertyImage.create({
      data: {
        propertyId: id,
        imageUrl,
        caption,
        isPrimary: isPrimary || false,
        sortOrder,
      },
    });

    res.status(201).json(createSuccessResponse(image, 'Image added successfully'));
  });

  static updateImage = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id, imageId } = req.params;
    const { caption, isPrimary, sortOrder } = req.body;

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if image exists
    const existingImage = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    });

    if (!existingImage || existingImage.propertyId !== id) {
      throw new AppError('Image not found', 404);
    }

    // If this is set as primary, update existing primary images
    if (isPrimary && !existingImage.isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { 
          propertyId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.propertyImage.update({
      where: { id: imageId },
      data: {
        ...(caption !== undefined && { caption }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json(createSuccessResponse(image, 'Image updated successfully'));
  });

  static deleteImage = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id, imageId } = req.params;

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && property.agentId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if image exists
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.propertyId !== id) {
      throw new AppError('Image not found', 404);
    }

    await prisma.propertyImage.delete({
      where: { id: imageId },
    });

    res.json(createSuccessResponse(null, 'Image deleted successfully'));
  });
}