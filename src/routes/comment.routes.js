const express = require('express');
const router = express.Router();


const commentController = require('../controllers/comment.controller');

const { createCommentValidation, updateCommentValidation } = require('../validators/comment.validator');
const { validate } = require('../middlewares/validate.middleware');


const { authenticate } = require('../middlewares/auth.middleware');
const { checkCommentOwnership } = require('../middlewares/ownership.middleware');

router.put(
  '/:id',
  authenticate,
  checkCommentOwnership,
  updateCommentValidation,
  validate,
  commentController.updateComment
);

router.delete(
  '/:id',
  authenticate,
  checkCommentOwnership,
  commentController.deleteComment
);

module.exports = router;