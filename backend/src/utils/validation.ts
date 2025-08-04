import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types/express';

export const handleValidationErrors = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorObj: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      const field = error.type === 'field' ? error.path : 'general';
      if (!errorObj[field]) {
        errorObj[field] = [];
      }
      errorObj[field].push(error.msg);
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorObj,
    });
  }
  next();
};

// Common validation rules
export const validateUUID = (field: string) => [
  param(field).isUUID().withMessage(`${field} must be a valid UUID`),
];

export const validateEmail = (field: string = 'email') => [
  body(field)
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
];

export const validatePassword = (field: string = 'password') => [
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

export const validateRequired = (fields: string[]) => {
  return fields.map(field => 
    body(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .trim()
  );
};

export const validateOptionalString = (field: string, maxLength?: number) => {
  const validator = body(field).optional().trim();
  if (maxLength) {
    validator.isLength({ max: maxLength }).withMessage(`${field} must not exceed ${maxLength} characters`);
  }
  return validator;
};

export const validateDate = (field: string) => [
  body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid date in ISO 8601 format`)
    .toDate(),
];

export const validateOptionalDate = (field: string) => [
  body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid date in ISO 8601 format`)
    .toDate(),
];

export const validateEnum = (field: string, enumValues: string[]) => [
  body(field)
    .isIn(enumValues)
    .withMessage(`${field} must be one of: ${enumValues.join(', ')}`),
];

export const validateOptionalEnum = (field: string, enumValues: string[]) => [
  body(field)
    .optional()
    .isIn(enumValues)
    .withMessage(`${field} must be one of: ${enumValues.join(', ')}`),
];

export const validateNumber = (field: string, min?: number, max?: number) => {
  const validator = body(field).isNumeric().withMessage(`${field} must be a number`);
  if (min !== undefined) {
    validator.custom(value => value >= min).withMessage(`${field} must be at least ${min}`);
  }
  if (max !== undefined) {
    validator.custom(value => value <= max).withMessage(`${field} must not exceed ${max}`);
  }
  return validator;
};

export const validateOptionalNumber = (field: string, min?: number, max?: number) => {
  const validator = body(field).optional().isNumeric().withMessage(`${field} must be a number`);
  if (min !== undefined) {
    validator.custom(value => !value || value >= min).withMessage(`${field} must be at least ${min}`);
  }
  if (max !== undefined) {
    validator.custom(value => !value || value <= max).withMessage(`${field} must not exceed ${max}`);
  }
  return validator;
};

export const validateArray = (field: string, maxLength?: number) => {
  const validator = body(field).isArray().withMessage(`${field} must be an array`);
  if (maxLength) {
    validator.custom(value => value.length <= maxLength).withMessage(`${field} must not exceed ${maxLength} items`);
  }
  return validator;
};

export const validateOptionalArray = (field: string, maxLength?: number) => {
  const validator = body(field).optional().isArray().withMessage(`${field} must be an array`);
  if (maxLength) {
    validator.custom(value => !value || value.length <= maxLength).withMessage(`${field} must not exceed ${maxLength} items`);
  }
  return validator;
};

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('SortBy must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either "asc" or "desc"'),
];