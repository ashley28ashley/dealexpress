const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Le username est requis'], 
        unique: true,
        trim: true,
        minlength: [3, 'Minimum 3 caractères'],
        maxlength: [30, 'Maximum 30 caractères']
    },
    email: { 
        type: String, 
        required: [true, 'L\'email est requis'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: { 
        type: String, 
        required: [true, 'Le mot de passe est requis'],
        minlength: [8, 'Minimum 8 caractères'],
        select: false 
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    bio: { 
        type: String, 
        default: '' 
    }
}, { 
    timestamps: true 
});


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        console.log('🔒 Hashing du password pour:', this.username);
        
        // Générer le salt et hasher en une seule étape
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
        console.log(' Password hashé');
        next();
    } catch (error) {
        console.error(' Erreur lors du hashing:', error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error(' Erreur lors de la comparaison:', error);
        throw error;
    }
};

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v; 
    return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;