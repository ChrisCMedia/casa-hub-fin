import { Router } from 'express';
import { CampaignController } from '@/controllers/campaign.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { 
  validateRequired,
  validateOptionalString,
  validateOptionalNumber,
  validateOptionalEnum,
  validateOptionalArray,
  validateUUID,
  validatePagination,
  validateDate,
  validateNumber,
  handleValidationErrors 
} from '@/utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

// Get campaigns with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  CampaignController.getCampaigns
);

// Get single campaign
router.get('/:id',
  validateUUID('id'),
  handleValidationErrors,
  CampaignController.getCampaign
);

// Create campaign (editors and admins only)
router.post('/',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateRequired(['name', 'type', 'budget', 'startDate', 'endDate']),
    validateOptionalString('propertyId'),
    validateOptionalString('targetAudience', 500),
    validateOptionalArray('platforms', 10),
    validateNumber('budget', 0),
    validateDate('startDate'),
    validateDate('endDate'),
  ],
  handleValidationErrors,
  CampaignController.createCampaign
);

// Update campaign
router.put('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    validateOptionalString('name', 255),
    validateOptionalString('propertyId'),
    validateOptionalEnum('type', ['SOCIAL_MEDIA', 'GOOGLE_ADS', 'PRINT', 'EVENT', 'EMAIL']),
    validateOptionalEnum('status', ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
    validateOptionalNumber('budget', 0),
    validateOptionalNumber('spent', 0),
    validateOptionalString('targetAudience', 500),
    validateOptionalArray('platforms', 10),
  ],
  handleValidationErrors,
  CampaignController.updateCampaign
);

// Delete campaign
router.delete('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  validateUUID('id'),
  handleValidationErrors,
  CampaignController.deleteCampaign
);

// Add KPI to campaign
router.post('/:id/kpis',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateRequired(['metric', 'target', 'unit']),
    validateNumber('target', 0),
  ],
  handleValidationErrors,
  CampaignController.addKPI
);

// Update campaign KPI
router.put('/:id/kpis/:kpiId',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateUUID('kpiId'),
    validateOptionalString('metric', 100),
    validateOptionalNumber('target', 0),
    validateOptionalNumber('current', 0),
    validateOptionalString('unit', 50),
  ],
  handleValidationErrors,
  CampaignController.updateKPI
);

// Delete campaign KPI
router.delete('/:id/kpis/:kpiId',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateUUID('kpiId'),
  ],
  handleValidationErrors,
  CampaignController.deleteKPI
);

export default router;