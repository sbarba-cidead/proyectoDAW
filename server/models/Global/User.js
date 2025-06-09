const mongoose = require('mongoose');

// modelo para creación de un usuario
const userSchema = new mongoose.Schema({
    avatar: {
        type: String,
        required: false, 
        default: 'default-avatar.png',
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        trim: true,
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
        trim: true,
    },
    resetPasswordExpires: { 
        type: Date,
    },
    banned: {
        type: Boolean,
        default: false,
    } // si el usuario ha sido baneado por un admin
}, { timestamps: true });

userSchema.index({ score: -1 });
userSchema.index({ 'messages._id': 1 });

module.exports = mongoose.model('User', userSchema);