const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


const generateToken = (userId, role) => {
  console.log(' Génération du token pour userId:', userId, 'role:', role);
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};


exports.register = async (req, res) => {
  console.log('\n === INSCRIPTION ===');
  try {
    const { username, email, password } = req.body;
    console.log('Username:', username);
    console.log('Email:', email);
    
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log(' Utilisateur existe déjà');
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Cet email est déjà utilisé' 
          : 'Ce username est déjà utilisé'
      });
    }
    
    // Créer l'utilisateur
    console.log('Création de l\'utilisateur...');
    const user = await User.create({
      username,
      email,
      password,
      role: 'user'
    });
    
    console.log('Utilisateur créé avec ID:', user._id);
    
    
    const token = generateToken(user._id, user.role);
    
    console.log(' Inscription réussie!\n');
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};


// CONNEXION

exports.login = async (req, res) => {
  console.log('\n🔐 === CONNEXION ===');
  try {
    const { email, password } = req.body;
    
    console.log('📧 Email reçu:', email);
    console.log('🔑 Password reçu:', password);
    
    console.log('🔍 Recherche de l\'utilisateur...');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(' Utilisateur non trouvé avec cet email');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    console.log('Utilisateur trouvé:', user.username);
    console.log(' User ID:', user._id);
    console.log(' Role:', user.role);
    console.log('Hash en base:', user.password ? user.password.substring(0, 30) + '...' : 'AUCUN PASSWORD!');
    
    // Vérifier que le password existe
    if (!user.password) {
      console.log(' ERREUR: Pas de password stocké pour cet utilisateur!');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration utilisateur'
      });
    }
    
    // Comparer les passwords
    console.log(' Comparaison du password avec bcrypt...');
    console.log('   - Password entré:', password);
    console.log('   - Hash à comparer:', user.password.substring(0, 30) + '...');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(' Résultat de la comparaison:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log(' Password incorrect!\n');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    console.log(' Password correct!');
    
    // Générer le token
    const token = generateToken(user._id, user.role);
    
    console.log(' Connexion réussie!\n');
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      }
    });
    
  } catch (error) {
    console.error('\n ERREUR COMPLÈTE:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  console.log('\n === RÉCUPÉRATION DU PROFIL ===');
  try {
    console.log('User ID:', req.user._id);
    console.log('Username:', req.user.username);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};