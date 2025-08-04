import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types/express';
import { createSuccessResponse, createPaginationResponse, getPaginationParams, asyncHandler } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { logger } from '@/config/logger';
import { PostStatus, UserRole } from '@prisma/client';

export class LinkedInController {
  static getPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, campaign } = req.query;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see posts they created
    if (req.user.role !== UserRole.ADMIN) {
      where.createdBy = req.user.id;
    }

    // Apply filters
    if (status) {
      where.status = status.toUpperCase() as PostStatus;
    }
    if (campaign) {
      where.campaignId = campaign;
    }

    const [posts, total] = await Promise.all([
      prisma.linkedInPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          media: {
            select: {
              id: true,
              filename: true,
              url: true,
              mediaType: true,
            },
          },
          analytics: true,
        },
      }),
      prisma.linkedInPost.count({ where }),
    ]);

    res.json(createPaginationResponse(posts, total, page, limit));
  });

  static getPost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            property: {
              select: {
                id: true,
                title: true,
                address: true,
              },
            },
          },
        },
        media: true,
        analytics: true,
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check access permissions
    if (req.user.role !== UserRole.ADMIN && post.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json(createSuccessResponse(post));
  });

  static createPost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { content, hashtags, scheduledDate, campaignId } = req.body;

    // Validate campaign exists if provided
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) {
        throw new AppError('Campaign not found', 400);
      }
      // Check if user has access to the campaign
      if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
        throw new AppError('Access denied to this campaign', 403);
      }
    }

    const post = await prisma.linkedInPost.create({
      data: {
        content,
        hashtags: hashtags || [],
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        campaignId,
        createdBy: req.user.id,
        status: PostStatus.DRAFT,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    logger.info('LinkedIn post created', { postId: post.id, userId: req.user.id });

    res.status(201).json(createSuccessResponse(post, 'Post created successfully'));
  });

  static updatePost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { content, hashtags, scheduledDate, campaignId } = req.body;

    // Check if post exists and user has permission
    const existingPost = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && existingPost.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Cannot edit published posts
    if (existingPost.status === PostStatus.PUBLISHED) {
      throw new AppError('Cannot edit published posts', 400);
    }

    // Validate campaign exists if provided
    if (campaignId && campaignId !== existingPost.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) {
        throw new AppError('Campaign not found', 400);
      }
      if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
        throw new AppError('Access denied to this campaign', 403);
      }
    }

    const post = await prisma.linkedInPost.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(hashtags && { hashtags }),
        ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
        ...(campaignId !== undefined && { campaignId }),
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        media: true,
      },
    });

    logger.info('LinkedIn post updated', { postId: post.id, userId: req.user.id });

    res.json(createSuccessResponse(post, 'Post updated successfully'));
  });

  static deletePost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Only creator or admin can delete
    if (req.user.role !== UserRole.ADMIN && post.createdBy !== req.user.id) {
      throw new AppError('Only the creator or admin can delete this post', 403);
    }

    // Cannot delete published posts
    if (post.status === PostStatus.PUBLISHED) {
      throw new AppError('Cannot delete published posts', 400);
    }

    await prisma.linkedInPost.delete({
      where: { id },
    });

    logger.info('LinkedIn post deleted', { postId: id, userId: req.user.id });

    res.json(createSuccessResponse(null, 'Post deleted successfully'));
  });

  static submitForApproval = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Only creator can submit for approval
    if (post.createdBy !== req.user.id) {
      throw new AppError('Only the creator can submit this post for approval', 403);
    }

    // Can only submit draft posts
    if (post.status !== PostStatus.DRAFT) {
      throw new AppError('Only draft posts can be submitted for approval', 400);
    }

    const updatedPost = await prisma.linkedInPost.update({
      where: { id },
      data: {
        status: PostStatus.PENDING_APPROVAL,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification for admins/editors
    await prisma.notification.createMany({
      data: await getApprovalNotificationData(updatedPost),
    });

    logger.info('LinkedIn post submitted for approval', { postId: id, userId: req.user.id });

    res.json(createSuccessResponse(updatedPost, 'Post submitted for approval'));
  });

  static approvePost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { approved, feedback } = req.body;

    // Only editors and admins can approve
    if (req.user.role === UserRole.GUEST) {
      throw new AppError('Insufficient permissions to approve posts', 403);
    }

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Can only approve pending posts
    if (post.status !== PostStatus.PENDING_APPROVAL) {
      throw new AppError('Only pending posts can be approved or rejected', 400);
    }

    const newStatus = approved ? PostStatus.APPROVED : PostStatus.REJECTED;

    const updatedPost = await prisma.linkedInPost.update({
      where: { id },
      data: {
        status: newStatus,
        approvedBy: req.user.id,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification for post creator
    await prisma.notification.create({
      data: {
        userId: post.createdBy,
        type: 'APPROVAL_NEEDED',
        title: approved ? 'Post Approved' : 'Post Rejected',
        message: approved 
          ? `Your LinkedIn post has been approved and is ready for publishing`
          : `Your LinkedIn post was rejected. ${feedback || 'Please review and make necessary changes.'}`,
        priority: 'MEDIUM',
      },
    });

    logger.info(`LinkedIn post ${approved ? 'approved' : 'rejected'}`, { 
      postId: id, 
      userId: req.user.id,
      approved 
    });

    res.json(createSuccessResponse(updatedPost, `Post ${approved ? 'approved' : 'rejected'} successfully`));
  });

  static schedulePost = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Only approved posts can be scheduled
    if (post.status !== PostStatus.APPROVED) {
      throw new AppError('Only approved posts can be scheduled', 400);
    }

    // Check permissions
    if (req.user.role !== UserRole.ADMIN && post.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const updatedPost = await prisma.linkedInPost.update({
      where: { id },
      data: {
        status: PostStatus.SCHEDULED,
        scheduledDate: new Date(scheduledDate),
        updatedAt: new Date(),
      },
    });

    logger.info('LinkedIn post scheduled', { postId: id, scheduledDate, userId: req.user.id });

    res.json(createSuccessResponse(updatedPost, 'Post scheduled successfully'));
  });

  static addMedia = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { filename, url, mediaType } = req.body;

    // Check if post exists and user has permission
    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && post.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Cannot add media to published posts
    if (post.status === PostStatus.PUBLISHED) {
      throw new AppError('Cannot modify published posts', 400);
    }

    const media = await prisma.postMedia.create({
      data: {
        postId: id,
        filename,
        url,
        mediaType,
        fileSize: 0, // This would come from actual file upload
        uploadedBy: req.user.id,
      },
    });

    res.status(201).json(createSuccessResponse(media, 'Media added successfully'));
  });

  static updateAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { views, likes, comments, shares, clickThroughRate, engagement } = req.body;

    // Only admins can update analytics (typically done by automated system)
    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Insufficient permissions to update analytics', 403);
    }

    const post = await prisma.linkedInPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const analytics = await prisma.postAnalytics.upsert({
      where: { postId: id },
      update: {
        ...(views !== undefined && { views }),
        ...(likes !== undefined && { likes }),
        ...(comments !== undefined && { comments }),
        ...(shares !== undefined && { shares }),
        ...(clickThroughRate !== undefined && { clickThroughRate }),
        ...(engagement !== undefined && { engagement }),
      },
      create: {
        postId: id,
        views: views || 0,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        clickThroughRate: clickThroughRate || 0,
        engagement: engagement || 0,
      },
    });

    res.json(createSuccessResponse(analytics, 'Analytics updated successfully'));
  });
}

async function getApprovalNotificationData(post: any) {
  const approvers = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.ADMIN, UserRole.EDITOR],
      },
    },
    select: { id: true },
  });

  return approvers.map(approver => ({
    userId: approver.id,
    type: 'APPROVAL_NEEDED' as const,
    title: 'Post Approval Required',
    message: `LinkedIn post "${post.content.substring(0, 50)}..." is waiting for your approval`,
    priority: 'MEDIUM' as const,
    actionUrl: `/linkedin/posts/${post.id}`,
  }));
}