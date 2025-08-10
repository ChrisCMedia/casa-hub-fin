import { Router } from 'express';
import { LeadController } from '@/controllers/lead.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { 
  validateRequired,
  validateOptionalString,
  validateOptionalNumber,
  validateOptionalEnum,
  validateOptionalArray,
  validateUUID,
  validatePagination,
  validateEmail,
  validateNumber,
  handleValidationErrors 
} from '@/utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// Get leads with filtering and pagination
router.get('/',
  ...(validatePagination as unknown as any[]),
  handleValidationErrors,
  LeadController.getLeads
);

// Get single lead
router.get('/:id',
  ...(validateUUID('id') as unknown as any[]),
  handleValidationErrors,
  LeadController.getLead
);

// Create lead (editors and admins only)
router.post('/',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...([
    ...validateRequired(['name', 'email', 'source']),
    ...validateEmail('email'),
    validateOptionalString('phone', 50),
    validateOptionalNumber('budgetMin', 0),
    validateOptionalNumber('budgetMax', 0),
    validateOptionalString('notes', 1000),
    validateOptionalString('assignedAgent'),
    validateOptionalArray('propertyInterests', 20),
  ] as unknown as any[]),
  handleValidationErrors,
  LeadController.createLead
);

// Update lead
router.put('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...([
    ...validateUUID('id'),
    validateOptionalString('name', 255),
    validateOptionalString('email', 255),
    validateOptionalString('phone', 50),
    validateOptionalEnum('status', ['NEW', 'CONTACTED', 'QUALIFIED', 'VIEWING_SCHEDULED', 'OFFER_MADE', 'CLOSED', 'LOST']),
    validateOptionalEnum('source', ['WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'COLD_CALL', 'EVENT']),
    validateOptionalNumber('budgetMin', 0),
    validateOptionalNumber('budgetMax', 0),
    validateOptionalString('notes', 1000),
    validateOptionalString('assignedAgent'),
  ] as unknown as any[]),
  handleValidationErrors,
  LeadController.updateLead
);

// Delete lead
router.delete('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...(validateUUID('id') as unknown as any[]),
  handleValidationErrors,
  LeadController.deleteLead
);

// Add property interest to lead
router.post('/:id/properties',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...([
    ...validateUUID('id'),
    ...validateRequired(['propertyId']),
  ] as unknown as any[]),
  handleValidationErrors,
  LeadController.addPropertyInterest
);

// Remove property interest from lead
router.delete('/:id/properties/:propertyId',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...([
    ...validateUUID('id'),
    ...validateUUID('propertyId'),
  ] as unknown as any[]),
  handleValidationErrors,
  LeadController.removePropertyInterest
);

// Update lead score
router.put('/:id/score',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  ...([
    ...validateUUID('id'),
    validateOptionalNumber('score', 0, 100),
  ] as unknown as any[]),
  handleValidationErrors,
  LeadController.updateScore
);

export default router;