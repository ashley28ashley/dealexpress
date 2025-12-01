const express = require('express');
const router = express.Router();

const dealController = require('../controllers/deal.controller');
const voteController = require('../controllers/vote.controller');
const commentController = require('../controllers/comment.controller');

const { createDealValidation, updateDealValidation } = require('../validators/deal.validator');
const { voteValidation } = require('../validators/vote.validator');
const { createCommentValidation } = require('../validators/comment.validator');
const { validate } = require('../middlewares/validate.middleware');

const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const { checkDealOwnership, checkDealPending } = require('../middlewares/ownership.middleware');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  return authenticate(req, res, next);
};



// GET /api/deals/search - Recherche de deals
router.get('/search', optionalAuth, dealController.searchDeals);



// GET /api/deals/:dealId/comments - Liste des commentaires d'un deal
router.get(
  '/:dealId/comments',
  commentController.getCommentsByDeal
);

// POST /api/deals/:dealId/comments - Créer un commentaire
router.post(
  '/:dealId/comments',
  authenticate,
  createCommentValidation,
  validate,
  commentController.createComment
);



// POST /api/deals/:id/vote - Voter sur un deal
router.post(
  '/:id/vote',
  authenticate,
  voteValidation,
  validate,
  voteController.voteOnDeal
);

// DELETE /api/deals/:id/vote - Retirer son vote
router.delete(
  '/:id/vote',
  authenticate,
  voteController.removeVote
);

// GET /api/deals/:id/votes - Statistiques de votes (public)
router.get(
  '/:id/votes',
  voteController.getDealVotes
);



// GET /api/deals - Liste des deals
router.get('/', optionalAuth, dealController.getAllDeals);

// GET /api/deals/:id - Détails d'un deal
router.get('/:id', optionalAuth, dealController.getDealById);

// POST /api/deals - Créer un deal
router.post(
  '/',
  authenticate,
  createDealValidation,
  validate,
  dealController.createDeal
);

// PUT /api/deals/:id - Modifier un deal
router.put(
  '/:id',
  authenticate,
  checkDealOwnership,
  checkDealPending,
  updateDealValidation,
  validate,
  dealController.updateDeal
);

// DELETE /api/deals/:id - Supprimer un deal
router.delete(
  '/:id',
  authenticate,
  checkDealOwnership,
  dealController.deleteDeal
);

module.exports = router;