const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');

const { moderateDealValidation, changeRoleValidation } = require('../validators/admin.validator');
const { validate } = require('../middlewares/validate.middleware');

const { authenticate, requireRole } = require('../middlewares/auth.middleware');


// GET /api/admin/deals/pending - Liste des deals en attente
router.get(
  '/deals/pending',
  authenticate,
  requireRole('moderator', 'admin'),
  adminController.getPendingDeals
);

// PATCH /api/admin/deals/:id/moderate - Approuver ou rejeter un deal
router.patch(
  '/deals/:id/moderate',
  authenticate,
  requireRole('moderator', 'admin'),
  moderateDealValidation,
  validate,
  adminController.moderateDeal
);


// GET /api/admin/users - Liste de tous les utilisateurs
router.get(
  '/users',
  authenticate,
  requireRole('admin'),
  adminController.getAllUsers
);

// PATCH /api/admin/users/:id/role - Changer le rôle d'un utilisateur
router.patch(
  '/users/:id/role',
  authenticate,
  requireRole('admin'),
  changeRoleValidation,
  validate,
  adminController.changeUserRole
);

module.exports = router;