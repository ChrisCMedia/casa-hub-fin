import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analytics.controller';
import { authenticate } from '@/middleware/auth';
import { 
  validateUUID,
  validateOptionalString,
  handleValidationErrors 
} from '@/utils/validation';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get('/dashboard',
  AnalyticsController.getDashboardStats
);

// Campaign analytics
router.get('/campaigns/:id',
  [
    ...validateUUID('id'),
    validateOptionalString('period'),
  ],
  handleValidationErrors,
  AnalyticsController.getCampaignAnalytics
);

// Lead analytics
router.get('/leads',
  [
    validateOptionalString('period'),
  ],
  handleValidationErrors,
  AnalyticsController.getLeadAnalytics
);

export default router;