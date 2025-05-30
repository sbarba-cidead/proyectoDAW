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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
                    refPath: 'messages.model'
                }, // id referencia al post o comentario
                model: {
                    type: String,
                    enum: ['ForumPost', 'ForumComment'],
                    required: true
                }, // si el mensaje es post o comentario (para mongoDB)
                type: {
                    type: String,
                    enum: ['post', 'reply'],
                    required: true
                } // si el mensaje es post o comentario (para filtrado en front)
            }
        ],
        default: []
    },
    resetPasswordToken: { 
        type: String,
    },
    resetPasswordExpires: { 
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);