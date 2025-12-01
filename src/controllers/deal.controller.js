const Deal = require('../models/Deal');
const User = require('../models/User');
const Vote = require('../models/Vote');

const enrichDealsWithVotes = async (deals) => {
  const enrichedDeals = await Promise.all(
    deals.map(async (deal) => {
      const dealObj = deal.toObject ? deal.toObject() : deal;
      
      const hotVotes = await Vote.countDocuments({
        dealId: dealObj._id,
        type: 'hot'
      });
      
      const coldVotes = await Vote.countDocuments({
        dealId: dealObj._id,
        type: 'cold'
      });
      
      return {
        ...dealObj,
        temperature: hotVotes - coldVotes,
        hotVotes,
        coldVotes,
        totalVotes: hotVotes + coldVotes
      };
    })
  );
  
  return enrichedDeals;
};

exports.getAllDeals = async (req, res) => {
  console.log('\nLISTE DES DEALS');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let filter = {};
    
    if (!req.user || req.user.role === 'user') {
      filter.status = 'approved';
      console.log('Utilisateur standard : affichage des deals approuvés uniquement');
    } else {
      console.log('Modérateur/Admin : affichage de tous les deals');
    }
    
    const total = await Deal.countDocuments(filter);
    
    const deals = await Deal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'username email role')
      .lean();
    
    const dealsWithVotes = await enrichDealsWithVotes(deals);
    
    console.log(`${deals.length} deals trouvés`);
    
    res.status(200).json({
      success: true,
      data: {
        deals: dealsWithVotes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération deals:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des deals',
      error: error.message
    });
  }
};

exports.searchDeals = async (req, res) => {
  console.log('\nRECHERCHE DE DEALS');
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "q" est requis pour la recherche'
      });
    }
    
    console.log('Recherche pour:', query);
    
    const regex = new RegExp(query, 'i');
    
    let filter = {
      $or: [
        { title: regex },
        { description: regex }
      ]
    };
    
    if (!req.user || req.user.role === 'user') {
      filter.status = 'approved';
    }
    
    const deals = await Deal.find(filter)
      .sort({ createdAt: -1 })
      .populate('authorId', 'username email')
      .lean();
    
    const dealsWithVotes = await enrichDealsWithVotes(deals);
    
    console.log(`${deals.length} résultats trouvés`);
    
    res.status(200).json({
      success: true,
      data: {
        query,
        count: deals.length,
        deals: dealsWithVotes
      }
    });
    
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};

exports.getDealById = async (req, res) => {
  console.log('\nDÉTAILS DU DEAL');
  try {
    const dealId = req.params.id;
    
    const deal = await Deal.findById(dealId)
      .populate('authorId', 'username email role createdAt')
      .lean();
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    if (deal.status !== 'approved') {
      const canView = req.user && (
        deal.authorId._id.toString() === req.user._id.toString() ||
        req.user.role === 'moderator' ||
        req.user.role === 'admin'
      );
      
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à voir ce deal'
        });
      }
    }
    
    const [dealWithVotes] = await enrichDealsWithVotes([deal]);
    
    console.log('Deal trouvé:', deal.title);
    
    res.status(200).json({
      success: true,
      data: { deal: dealWithVotes }
    });
    
  } catch (error) {
    console.error('Erreur récupération deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du deal',
      error: error.message
    });
  }
};

exports.createDeal = async (req, res) => {
  console.log('\nCRÉATION D\'UN DEAL');
  try {
    const { title, description, price, originalPrice, url, category } = req.body;
    
    console.log('Auteur:', req.user.username);
    console.log('Titre:', title);
    
    const deal = await Deal.create({
      title,
      description,
      price,
      originalPrice,
      url,
      category,
      authorId: req.user._id,
      status: 'pending'
    });
    
    await deal.populate('authorId', 'username email');
    
    console.log('Deal créé avec ID:', deal._id);
    console.log('Status:', deal.status);
    
    res.status(201).json({
      success: true,
      message: 'Deal créé avec succès. En attente de modération.',
      data: { deal }
    });
    
  } catch (error) {
    console.error('Erreur création deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du deal',
      error: error.message
    });
  }
};

exports.updateDeal = async (req, res) => {
  console.log('\nMODIFICATION D\'UN DEAL');
  try {
    const { title, description, price, originalPrice, url, category } = req.body;
    
    const deal = req.deal;
    
    console.log('Modification du deal:', deal.title);
    
    if (title) deal.title = title;
    if (description) deal.description = description;
    if (price !== undefined) deal.price = price;
    if (originalPrice !== undefined) deal.originalPrice = originalPrice;
    if (url) deal.url = url;
    if (category) deal.category = category;
    
    await deal.save();
    await deal.populate('authorId', 'username email');
    
    console.log('Deal modifié avec succès');
    
    res.status(200).json({
      success: true,
      message: 'Deal modifié avec succès',
      data: { deal }
    });
    
  } catch (error) {
    console.error('Erreur modification deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du deal',
      error: error.message
    });
  }
};

exports.deleteDeal = async (req, res) => {
  console.log('\nSUPPRESSION D\'UN DEAL');
  try {
    const deal = req.deal;
    
    console.log('Suppression du deal:', deal.title);
    console.log('Par:', req.user.username);
    
    await deal.deleteOne();
    
    console.log('Deal supprimé avec succès');
    
    res.status(200).json({
      success: true,
      message: 'Deal supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du deal',
      error: error.message
    });
  }
};
