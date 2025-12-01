const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  const formattedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));
  
  return res.status(400).json({
    success: false,
    message: 'Erreurs de validation',
    errors: formattedErrors
  });
};