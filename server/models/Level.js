const mongoose = require('mongoose');

// modelo para creación de un nivel
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
        unique: true,
    },
    minScore: {
        type: Number,
        required: true,
        unique: false,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    maxScore: {
        type: Number,
        required: true,
        unique: false,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    color: {
        type: String,
        required: true,
        unique: false,
    },
    text: {
        type: String,
        required: true,
        unique: true,
    },
    icon: {
        type: String,
        required: true,
        unique: false,
    },
}, { timestamps: false });

module.exports = mongoose.model('Level', UserSchema);