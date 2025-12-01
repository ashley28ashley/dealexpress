const { body } = require('express-validator');

exports.voteValidation = [
  body('type')
    .isIn(['hot', 'cold'])
    .withMessage('Le type de vote doit être "hot" ou "cold"')
];