const { body } = require('express-validator');

exports.createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Le commentaire doit contenir entre 3 et 500 caractères')
    .notEmpty()
    .withMessage('Le contenu du commentaire ne peut pas être vide')
];

exports.updateCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Le commentaire doit contenir entre 3 et 500 caractères')
    .notEmpty()
    .withMessage('Le contenu du commentaire ne peut pas être vide')
];