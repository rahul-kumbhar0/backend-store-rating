const Joi = require('joi');

// User registration validation
const registerValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(20).max(60).required()
      .messages({
        'string.min': 'Name must be at least 20 characters long',
        'string.max': 'Name must be less than or equal to 60 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(8).max(16)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be less than or equal to 16 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter and one special character',
        'any.required': 'Password is required'
      }),
    address: Joi.string().max(400).allow('')
      .messages({
        'string.max': 'Address must be less than or equal to 400 characters'
      }),
    role: Joi.string().valid('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER')
      .optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation error',
      errors 
    });
  }

  next();
};

// User login validation
const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation error',
      errors 
    });
  }

  next();
};

// Store validation
const storeValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(60).required()
      .messages({
        'string.min': 'Store name is required',
        'string.max': 'Store name must be less than or equal to 60 characters',
        'any.required': 'Store name is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email for the store',
        'any.required': 'Store email is required'
      }),
    address: Joi.string().max(400).required()
      .messages({
        'string.max': 'Store address must be less than or equal to 400 characters',
        'any.required': 'Store address is required'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation error',
      errors 
    });
  }

  next();
};

// Rating validation
// Rating validation
// Rating validation
// In middleware/validation.js, modify ratingValidation:
const ratingValidation = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required()
      .messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating must be at most 5',
        'number.integer': 'Rating must be an integer',
        'any.required': 'Rating is required'
      }),
    storeId: Joi.number().integer()
      .when('$requestMethod', {
        is: Joi.string().valid('POST'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'number.base': 'Store ID must be a number',
        'any.required': 'Store ID is required'
      })
  });

  const { error } = schema.validate(req.body, { 
    abortEarly: false,
    context: { requestMethod: req.method }
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation error',
      errors 
    });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  storeValidation,
  ratingValidation
};