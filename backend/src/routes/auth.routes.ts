import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate, rateLimitByUser } from '@/middleware/auth';
import { 
  validateEmail, 
  validatePassword, 
  validateRequired,
  validateOptionalString,
  handleValidationErrors 
} from '@/utils/validation';

const router = Router();

// Rate limiting for auth routes
const authRateLimit = rateLimitByUser(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const generalRateLimit = rateLimitByUser(60 * 1000, 10); // 10 requests per minute

// Public routes
router.post('/login', 
  authRateLimit,
  [
    ...validateRequired(['email', 'password']),
    ...validateEmail('email'),
  ],
  handleValidationErrors,
  AuthController.login
);

router.post('/register',
  authRateLimit,
  [
    ...validateRequired(['name', 'email', 'password']),
    ...validateEmail('email'),
    ...validatePassword('password'),
    validateOptionalString('role'),
  ],
  handleValidationErrors,
  AuthController.register
);

router.post('/refresh',
  generalRateLimit,
  [
    ...validateRequired(['refreshToken']),
  ],
  handleValidationErrors,
  AuthController.refreshToken
);

// Protected routes
router.post('/logout',
  authenticate,
  AuthController.logout
);

router.get('/me',
  authenticate,
  AuthController.me
);

router.put('/change-password',
  authenticate,
  generalRateLimit,
  [
    ...validateRequired(['currentPassword', 'newPassword']),
    ...validatePassword('newPassword'),
  ],
  handleValidationErrors,
  AuthController.changePassword
);

router.put('/profile',
  authenticate,
  generalRateLimit,
  [
    validateOptionalString('name', 100),
    validateOptionalString('avatarUrl', 500),
  ],
  handleValidationErrors,
  AuthController.updateProfile
);

router.delete('/account',
  authenticate,
  authRateLimit,
  [
    ...validateRequired(['password']),
  ],
  handleValidationErrors,
  AuthController.deleteAccount
);

export default router;