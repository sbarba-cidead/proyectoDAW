const mongoose = require('mongoose');

// modelo para nivel de usuario según puntuación
const userLevelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
        unique: true,
        trim: true,
    },
    minScore: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    maxScore: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        required: true,
        trim: true,
    },
}, { 
    collection: 'userlevels'
});

userLevelSchema.index({ minScore: 1, maxScore: 1 });

module.exports = mongoose.model('UserLevel', userLevelSchema);