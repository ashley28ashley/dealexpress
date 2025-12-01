const { body } = require('express-validator');

exports.moderateDealValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Le status doit être "approved" ou "rejected"')
];

exports.changeRoleValidation = [
  body('role')
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Le rôle doit être "user", "moderator" ou "admin"')
];