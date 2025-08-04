import { Router } from 'express';
import { PropertyController } from '@/controllers/property.controller';
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

// All property routes require authentication
router.use(authenticate);

// Get properties with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  PropertyController.getProperties
);

// Get single property
router.get('/:id',
  validateUUID('id'),
  handleValidationErrors,
  PropertyController.getProperty
);

// Create property (editors and admins only)
router.post('/',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateRequired(['title', 'address', 'type', 'price', 'area', 'rooms', 'listingDate']),
    validateOptionalString('description', 2000),
    validateOptionalArray('features', 20),
    validateOptionalString('agentId'),
    validateNumber('price', 0),
    validateNumber('area', 0),
    validateNumber('rooms', 1),
    validateDate('listingDate'),
  ],
  handleValidationErrors,
  PropertyController.createProperty
);

// Update property
router.put('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    validateOptionalString('title', 255),
    validateOptionalString('address', 500),
    validateOptionalEnum('type', ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND']),
    validateOptionalEnum('status', ['AVAILABLE', 'UNDER_CONTRACT', 'SOLD', 'RENTED']),
    validateOptionalNumber('price', 0),
    validateOptionalNumber('area', 0),
    validateOptionalNumber('rooms', 1),
    validateOptionalString('description', 2000),
    validateOptionalArray('features', 20),
    validateOptionalString('agentId'),
  ],
  handleValidationErrors,
  PropertyController.updateProperty
);

// Delete property
router.delete('/:id',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  validateUUID('id'),
  handleValidationErrors,
  PropertyController.deleteProperty
);

// Add image to property
router.post('/:id/images',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateRequired(['imageUrl']),
    validateOptionalString('caption', 255),
  ],
  handleValidationErrors,
  PropertyController.addImage
);

// Update property image
router.put('/:id/images/:imageId',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateUUID('imageId'),
    validateOptionalString('caption', 255),
    validateOptionalNumber('sortOrder', 0),
  ],
  handleValidationErrors,
  PropertyController.updateImage
);

// Delete property image
router.delete('/:id/images/:imageId',
  authorize(UserRole.EDITOR, UserRole.ADMIN),
  [
    ...validateUUID('id'),
    ...validateUUID('imageId'),
  ],
  handleValidationErrors,
  PropertyController.deleteImage
);

export default router;