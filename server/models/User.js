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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserLevel',
        required: false,
    },
    recyclingActivities: { 
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'RecyclingActivity',
        required: false,
        default: []
    },
    messages: {
        type: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'messages.type'
                },
                model: {
                    type: String,
                    enum: ['ForumPost', 'ForumComment'],
                    required: true
                },
                type: {
                    type: String,
                    enum: ['post', 'reply'],
                    required: true
                }
            }
        ],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);