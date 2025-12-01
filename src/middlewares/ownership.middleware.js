const Deal = require('../models/Deal');
const Comment = require('../models/Comment');

exports.checkDealOwnership = async (req, res, next) => {
  try {
    const dealId = req.params.id;
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    const isOwner = deal.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce deal'
      });
    }
    
    req.deal = deal;
    next();
    
  } catch (error) {
    console.error('Erreur vérification ownership:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

exports.checkDealPending = (req, res, next) => {

    if (req.deal.status !== 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Vous ne pouvez modifier que les deals en attente de modération'
    });
  }
  next();
};

exports.checkCommentOwnership = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }
    
    const isOwner = comment.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce commentaire'
      });
    }
    
    req.comment = comment;
    next();
    
  } catch (error) {
    console.error('Erreur vérification ownership commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};