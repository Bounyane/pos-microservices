const Joi = require('joi');
const ApiResponse = require('../utils/response');

// Validation schemas
const userSchemas = {
  register: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('DEALER', 'MANAGER', 'CUSTOMER', 'ADMIN', 'DELIVERY', 'WAITER')
      .default('CUSTOMER')
      .messages({
        'any.only': 'Role must be one of: DEALER, MANAGER, CUSTOMER, ADMIN, DELIVERY, WAITER'
      })
  }),

  update: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required'
    }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    profileImage: Joi.string()
      .uri()
      .messages({
        'string.uri': 'Please provide a valid image URL'
      })
  }),

  manager: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required'
    }),
    storeType: Joi.string()
      .valid('restaurant', 'supermarket', 'cafe', 'bakery', 'pharmacy', 'clothing', 'electronics', 'other')
      .required()
      .messages({
        'any.only': 'Store type must be one of: restaurant, supermarket, cafe, bakery, pharmacy, clothing, electronics, other',
        'any.required': 'Store type is required'
      }),
    storeName: Joi.string()
    //       .min(2)
    //       .max(100)
    //       .required()
    //       .messages({
    //         'string.min': 'Store name must be at least 2 characters long',
    //         'string.max': 'Store name cannot exceed 100 characters',
    //         'any.required': 'Store name is required'
    //       }),
    //     storeAddress: Joi.object({
    //       street: Joi.string().required(),
    //       city: Joi.string().required(),
    //       state: Joi.string().required(),
    //       zipCode: Joi.string().required(),
    //       country: Joi.string().default('US')
    //     }).required(),
    //     storePhone: Joi.string()
    //       .pattern(/^\+?[\d\s\-\(\)]+$/)
    //       .required()
    //       .messages({
    //         'string.pattern.base': 'Please provide a valid phone number',
    //         'any.required': 'Store phone is required'
    //       }),
    //     storeEmail: Joi.string()
    //       .email()
    //       .required()
    //       .messages({
    //         'string.email': 'Please provide a valid email address',
    //         'any.required': 'Store email is required'
    //       }),
    //     businessLicense: Joi.string().required(),
    //     taxId: Joi.string().required(),
    //     storeDescription: Joi.string().max(500)
  }),

  dealer: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required'
    }),
    dealerType: Joi.string()
      .valid('individual', 'company')
      .required()
      .messages({
        'any.only': 'Dealer type must be either individual or company',
        'any.required': 'Dealer type is required'
      }),
    companyName: Joi.when('dealerType', {
      then: Joi.string().min(2).max(100).required(),
      otherwise: Joi.forbidden()
    }),
    businessAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    // companyRegistrationNumber: Joi.when('dealerType', {
    //     is: 'company',
    //     then: Joi.string().required(),
    //     otherwise: Joi.forbidden()
    //   }),
    //   businessPhone: Joi.string()
    //     .pattern(/^\+?[\d\s\-\(\)]+$/)
    //     .required()
    //     .messages({
    //       'string.pattern.base': 'Please provide a valid phone number',
    //       'any.required': 'Business phone is required'
    //     }),
    //   businessEmail: Joi.string()
    //     .email()
    //     .required()
    //     .messages({
    //       'string.email': 'Please provide a valid email address',
    //       'any.required': 'Business email is required'
    //     }),
    //   taxId: Joi.string().required(),
    //   businessLicense: Joi.string().required(),
    //   businessDescription: Joi.string().max(500),
    //   specialties: Joi.array().items(Joi.string()),
    //   serviceAreas: Joi.array().items(
    //     Joi.object({
    //       city: Joi.string().required(),
    //       state: Joi.string().required(),
    //       country: Joi.string().default('US')
    //     })
    //   ),
    //   yearsInBusiness: Joi.number().min(0).max(100)
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return ApiResponse.validationError(res, errors);
    }

    req.body = value;
    next();
  };
};

// Export validation functions
module.exports = {
  validateUserRegister: validate(userSchemas.register),
  validateUserUpdate: validate(userSchemas.update),
  validateManager: validate(userSchemas.manager),
  validateDealer: validate(userSchemas.dealer),
  validate
}; 