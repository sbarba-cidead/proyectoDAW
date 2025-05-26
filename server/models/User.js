const mongoose = require('mongoose');

// modelo para creación de un usuario
const UserSchema = new mongoose.Schema({
    avatar: {
        type: String,
        required: false, 
        default: 'default-avatar.png',
    },
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: false,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    level: {
        type: String,
        required: false,
        default: 'beginner'
    },
    recyclingActivities: { 
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'RecyclingActivity',
        required: false,
        default: []
    },
    messages: {
        type: [],
        required: false,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);