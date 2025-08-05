import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, TodoFilters } from '@/types/express';
import { createSuccessResponse, createPaginationResponse, getPaginationParams, asyncHandler } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { logger } from '@/config/logger';
import { TodoPriority, TodoStatus, UserRole } from '@prisma/client';

export class TodoController {
  static getTodos = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, priority, assignedTo, tags, dueDate } = req.query;

    // Build where clause based on user role and filters
    const where: any = {};

    // Non-admin users can only see todos they created or are assigned to
    if (req.user.role !== UserRole.ADMIN) {
      where.OR = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
      ];
    }

    // Apply filters
    if (status) {
      where.status = status.toUpperCase() as TodoStatus;
    }
    if (priority) {
      where.priority = priority.toUpperCase() as TodoPriority;
    }
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }
    if (tags) {
      where.tags = {
        hasSome: tags.split(',').map(tag => tag.trim()),
      };
    }
    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
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
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              url: true,
              fileType: true,
              fileSize: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      }),
      prisma.todo.count({ where }),
    ]);

    res.json(createPaginationResponse(todos, total, page, limit));
  });

  static getTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
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
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        attachments: true,
      },
    });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Check access permissions
    if (req.user.role !== UserRole.ADMIN && 
        todo.createdBy !== req.user.id && 
        todo.assignedTo !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json(createSuccessResponse(todo));
  });

  static createTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { title, description, priority, assignedTo, dueDate, tags } = req.body;

    // Validate assignee exists if provided
    if (assignedTo) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedTo },
      });
      if (!assignee) {
        throw new AppError('Assigned user not found', 400);
      }
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority?.toUpperCase() as TodoPriority || TodoPriority.MEDIUM,
        assignedTo,
        createdBy: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
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

    logger.info('Todo created', { todoId: todo.id, userId: req.user.id });

    res.status(201).json(createSuccessResponse(todo, 'Todo created successfully'));
  });

  static updateTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { title, description, priority, status, assignedTo, dueDate, tags } = req.body;

    // Check if todo exists and user has permission
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new AppError('Todo not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && 
        existingTodo.createdBy !== req.user.id && 
        existingTodo.assignedTo !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate assignee exists if provided
    if (assignedTo && assignedTo !== existingTodo.assignedTo) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedTo },
      });
      if (!assignee) {
        throw new AppError('Assigned user not found', 400);
      }
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority: priority.toUpperCase() as TodoPriority }),
        ...(status && { status: status.toUpperCase() as TodoStatus }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags && { tags }),
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
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

    logger.info('Todo updated', { todoId: todo.id, userId: req.user.id });

    res.json(createSuccessResponse(todo, 'Todo updated successfully'));
  });

  static deleteTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Only creator or admin can delete
    if (req.user.role !== UserRole.ADMIN && todo.createdBy !== req.user.id) {
      throw new AppError('Only the creator or admin can delete this todo', 403);
    }

    await prisma.todo.delete({
      where: { id },
    });

    logger.info('Todo deleted', { todoId: id, userId: req.user.id });

    res.json(createSuccessResponse(null, 'Todo deleted successfully'));
  });

  static addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { content, parentId, mentions } = req.body;

    // Check if todo exists and user has access
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && 
        todo.createdBy !== req.user.id && 
        todo.assignedTo !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await prisma.todoComment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment || parentComment.todoId !== id) {
        throw new AppError('Parent comment not found', 400);
      }
    }

    const comment = await prisma.todoComment.create({
      data: {
        todoId: id,
        content,
        authorId: req.user.id,
        parentId,
        mentions: mentions || [],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(createSuccessResponse(comment, 'Comment added successfully'));
  });

  static getComments = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;

    // Check if todo exists and user has access
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && 
        todo.createdBy !== req.user.id && 
        todo.assignedTo !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const comments = await prisma.todoComment.findMany({
      where: { 
        todoId: id,
        parentId: null, // Only top-level comments
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.json(createSuccessResponse(comments));
  });
}