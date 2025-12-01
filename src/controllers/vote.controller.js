const Vote = require('../models/Vote');
const Deal = require('../models/Deal');

const calculateTemperature = async (dealId) => {
  const hotVotes = await Vote.countDocuments({
    dealId,
    type: 'hot'
  });
  
  const coldVotes = await Vote.countDocuments({
    dealId,
    type: 'cold'
  });
  
  const temperature = hotVotes - coldVotes;
  
  return {
    temperature,
    hotVotes,
    coldVotes,
    totalVotes: hotVotes + coldVotes
  };
};

exports.voteOnDeal = async (req, res) => {
  try {
    const dealId = req.params.id;
    const { type } = req.body;
    const userId = req.user._id;
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    if (deal.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez voter que sur des deals approuvés'
      });
    }
    
    const existingVote = await Vote.findOne({
      userId,
      dealId
    });
    
    if (existingVote) {
      if (existingVote.type === type) {
        const stats = await calculateTemperature(dealId);
        
        return res.status(200).json({
          success: true,
          message: `Vous avez déjà voté "${type}" pour ce deal`,
          data: {
            vote: existingVote,
            ...stats
          }
        });
      }
      
      existingVote.type = type;
      await existingVote.save();
      
      const stats = await calculateTemperature(dealId);
      
      return res.status(200).json({
        success: true,
        message: `Vote modifié en "${type}"`,
        data: {
          vote: existingVote,
          ...stats
        }
      });
    }
    
    const vote = await Vote.create({
      type,
      userId,
      dealId
    });
    
    const stats = await calculateTemperature(dealId);
    
    res.status(201).json({
      success: true,
      message: `Vote "${type}" enregistré avec succès`,
      data: {
        vote,
        ...stats
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du vote',
      error: error.message
    });
  }
};

exports.removeVote = async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user._id;
    
    const vote = await Vote.findOne({
      userId,
      dealId
    });
    
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vous n\'avez pas voté sur ce deal'
      });
    }
    
    await vote.deleteOne();
    
    const stats = await calculateTemperature(dealId);
    
    res.status(200).json({
      success: true,
      message: 'Vote retiré avec succès',
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du vote',
      error: error.message
    });
  }
};

exports.getDealVotes = async (req, res) => {
  try {
    const dealId = req.params.id;
    
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvé'
      });
    }
    
    const stats = await calculateTemperature(dealId);
    
    const votes = await Vote.find({ dealId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        dealId,
        ...stats,
        votes
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des votes',
      error: error.message
    });
  }
};
