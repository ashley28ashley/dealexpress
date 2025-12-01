const Deal = require('../models/Deal');
const User = require('../models/User');


exports.getPendingDeals = async (req, res) => {
  console.log('\n === DEALS EN ATTENTE DE MODÉRATION ===');
  try {
    console.log(' Modérateur:', req.user.username);
    
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    
    const filter = { status: 'pending' };
    
    const total = await Deal.countDocuments(filter);
    
    const deals = await Deal.find(filter)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'username email createdAt')
      .lean();
    
    console.log(` ${deals.length} deals en attente trouvés`);
    
    res.status(200).json({
      success: true,
      data: {
        deals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error(' Erreur récupération deals pending:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des deals en attente',
      error: error.message
    });
  }
};


exports.moderateDeal = async (req, res) => {
  console.log('\n === MODÉRATION D\'UN DEAL ===');
  try {
    const dealId = req.params.id;
    const { status } = req.body;
    
    console.log(' Modérateur:', req.user.username);
    console.log(' Deal ID:', dealId);
    console.log(' Nouveau status:', status);
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Le status doit être "approved" ou "rejected"'
      });
    }
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    deal.status = status;
    await deal.save();
    
    await deal.populate('authorId', 'username email');
    
    console.log(` Deal ${status === 'approved' ? 'approuvé' : 'rejeté'}`);
    
    res.status(200).json({
      success: true,
      message: `Deal ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      data: { deal }
    });
    
  } catch (error) {
    console.error(' Erreur modération deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modération du deal',
      error: error.message
    });
  }
};


exports.getAllUsers = async (req, res) => {
  console.log('\n === LISTE DES UTILISATEURS ===');
  try {
    console.log(' Admin:', req.user.username);
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const total = await User.countDocuments();
    
    const users = await User.find()
      .select('-password') 
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log(` ${users.length} utilisateurs trouvés`);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error(' Erreur récupération users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};


exports.changeUserRole = async (req, res) => {
  console.log('\n === CHANGEMENT DE RÔLE ===');
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    console.log(' Admin:', req.user.username);
    console.log(' User ID:', userId);
    console.log(' Nouveau rôle:', role);
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Le rôle doit être "user", "moderator" ou "admin"'
      });
    }
    
    // Empêcher un admin de se retirer lui-même les droits admin
    if (userId === req.user._id.toString() && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }
    
    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const oldRole = user.role;
    
    // Mettre à jour le rôle
    user.role = role;
    await user.save();
    
    console.log(`Rôle changé de ${oldRole} à ${role}`);
    
    res.status(200).json({
      success: true,
      message: `Rôle de ${user.username} changé de "${oldRole}" à "${role}" avec succès`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error(' Erreur changement rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de rôle',
      error: error.message
    });
  }
};