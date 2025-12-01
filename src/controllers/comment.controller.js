const Comment = require('../models/Comment');
const Deal = require('../models/Deal');


exports.getCommentsByDeal = async (req, res) => {
  console.log('\n === LISTE DES COMMENTAIRES ===');
  try {
    const dealId = req.params.dealId;
    
    console.log(' Deal ID:', dealId);
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    const comments = await Comment.find({ dealId })
      .sort({ createdAt: -1 }) 
      .populate('authorId', 'username email role createdAt') 
    
    console.log(` ${comments.length} commentaires trouvés`);
    
    res.status(200).json({
      success: true,
      data: {
        dealId,
        count: comments.length,
        comments
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
};


exports.createComment = async (req, res) => {
  console.log('\n === CRÉATION D\'UN COMMENTAIRE ===');
  try {
    const dealId = req.params.dealId;
    const { content } = req.body;
    
    console.log(' Auteur:', req.user.username);
    console.log(' Deal ID:', dealId);
    console.log(' Contenu:', content);
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    const comment = await Comment.create({
      content,
      dealId,
      authorId: req.user._id
    });
    
    await comment.populate('authorId', 'username email role');
    
    console.log(' Commentaire créé avec ID:', comment._id);
    
    res.status(201).json({
      success: true,
      message: 'Commentaire créé avec succès',
      data: { comment }
    });
    
  } catch (error) {
    console.error(' Erreur création commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du commentaire',
      error: error.message
    });
  }
};

exports.updateComment = async (req, res) => {
  console.log('\n === MODIFICATION D\'UN COMMENTAIRE ===');
  try {
    const { content } = req.body;
    
    const comment = req.comment;
    
    console.log(' Modification du commentaire ID:', comment._id);
    console.log(' Nouveau contenu:', content);
    
    comment.content = content;
    await comment.save();
    
    await comment.populate('authorId', 'username email role');
    
    console.log(' Commentaire modifié avec succès');
    
    res.status(200).json({
      success: true,
      message: 'Commentaire modifié avec succès',
      data: { comment }
    });
    
  } catch (error) {
    console.error(' Erreur modification commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du commentaire',
      error: error.message
    });
  }
};


exports.deleteComment = async (req, res) => {
  console.log('\n === SUPPRESSION D\'UN COMMENTAIRE ===');
  try {
    const comment = req.comment;
    
    console.log(' Suppression du commentaire ID:', comment._id);
    console.log(' Par:', req.user.username);
    
    await comment.deleteOne();
    
    console.log(' Commentaire supprimé avec succès');
    
    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
    
  } catch (error) {
    console.error(' Erreur suppression commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
};