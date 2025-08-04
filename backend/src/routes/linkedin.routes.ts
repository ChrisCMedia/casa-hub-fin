import { Router } from 'express';
import { LinkedInController } from '@/controllers/linkedin.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { 
  validateRequired,
  validateOptionalString,
  validateOptionalArray,
  validateOptionalDate,
  validateOptionalNumber,
  validateUUID,
  validatePagination,
  handleValidationErrors 
} from '@/utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All LinkedIn routes require authentication
router.use(authenticate);

// Get posts with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  LinkedInController.getPosts
);

// Get single post
router.get('/:id',
  validateUUID('id'),
  handleValidationErrors,
  LinkedInController.getPost
);

// Create post (editors and admins can create posts)
router.post('/',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateRequired(['content']),
    validateOptionalArray('hashtags', 20),
    validateOptionalDate('scheduledDate'),
    validateOptionalString('campaignId'),
  ],
  handleValidationErrors,
  LinkedInController.createPost
);

// Update post
router.put('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    validateOptionalString('content', 3000),
    validateOptionalArray('hashtags', 20),
    validateOptionalDate('scheduledDate'),
    validateOptionalString('campaignId'),
  ],
  handleValidationErrors,
  LinkedInController.updatePost
);

// Delete post
router.delete('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  validateUUID('id'),
  handleValidationErrors,
  LinkedInController.deletePost
);

// Submit post for approval
router.post('/:id/submit',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  validateUUID('id'),
  handleValidationErrors,
  LinkedInController.submitForApproval
);

// Approve/reject post (editors and admins only)
router.post('/:id/approve',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateRequired(['approved']),
    validateOptionalString('feedback', 500),
  ],
  handleValidationErrors,
  LinkedInController.approvePost
);

// Schedule approved post
router.post('/:id/schedule',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateRequired(['scheduledDate']),
  ],
  handleValidationErrors,
  LinkedInController.schedulePost
);

// Add media to post
router.post('/:id/media',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateRequired(['filename', 'url', 'mediaType']),
  ],
  handleValidationErrors,
  LinkedInController.addMedia
);

// Update post analytics (admin only)
router.put('/:id/analytics',
  authorize(UserRole.ADMIN),
  [
    ...validateUUID('id'),
    validateOptionalNumber('views', 0),
    validateOptionalNumber('likes', 0),
    validateOptionalNumber('comments', 0),
    validateOptionalNumber('shares', 0),
    validateOptionalNumber('clickThroughRate', 0, 100),
    validateOptionalNumber('engagement', 0, 100),
  ],
  handleValidationErrors,
  LinkedInController.updateAnalytics
);

export default router;