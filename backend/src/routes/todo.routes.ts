import { Router } from 'express';
import { TodoController } from '@/controllers/todo.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { 
  validateRequired,
  validateOptionalString,
  validateOptionalDate,
  validateOptionalEnum,
  validateOptionalArray,
  validateUUID,
  validatePagination,
  handleValidationErrors 
} from '@/utils/validation';

const router = Router();

// All todo routes require authentication
router.use(authenticate);

// Get todos with filtering and pagination
router.get('/',
  ...(validatePagination as unknown as any[]),
  handleValidationErrors,
  TodoController.getTodos
);

// Get single todo
router.get('/:id',
  ...(validateUUID('id') as unknown as any[]),
  handleValidationErrors,
  TodoController.getTodo
);

// Create todo
router.post('/',
  ...([
    ...validateRequired(['title']),
    validateOptionalString('description', 1000),
    validateOptionalEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    validateOptionalString('assignedTo'),
    validateOptionalDate('dueDate'),
    validateOptionalArray('tags', 10),
  ] as unknown as any[]),
  handleValidationErrors,
  TodoController.createTodo
);

// Update todo
router.put('/:id',
  ...([
    ...validateUUID('id'),
    validateOptionalString('title', 255),
    validateOptionalString('description', 1000),
    validateOptionalEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    validateOptionalEnum('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    validateOptionalString('assignedTo'),
    validateOptionalDate('dueDate'),
    validateOptionalArray('tags', 10),
  ] as unknown as any[]),
  handleValidationErrors,
  TodoController.updateTodo
);

// Delete todo
router.delete('/:id',
  ...(validateUUID('id') as unknown as any[]),
  handleValidationErrors,
  TodoController.deleteTodo
);

// Get todo comments
router.get('/:id/comments',
  ...(validateUUID('id') as unknown as any[]),
  handleValidationErrors,
  TodoController.getComments
);

// Add comment to todo
router.post('/:id/comments',
  ...([
    ...validateUUID('id'),
    ...validateRequired(['content']),
    validateOptionalString('parentId'),
    validateOptionalArray('mentions', 10),
  ] as unknown as any[]),
  handleValidationErrors,
  TodoController.addComment
);

export default router;