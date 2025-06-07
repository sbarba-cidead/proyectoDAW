const { boolean } = require('joi');
const mongoose = require('mongoose');

// modelo para un post del foro
const forumPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
  }, // título del post
  content: { 
    type: String, 
    required: true,
    trim: true,
  }, // contenido del post
  createdAt: { 
    type: Date,
    default: Date.now,
  }, // fecha en la que el post fue creado
  lastReplyAt: { 
    type: Date,
    default: Date.now,
  }, // fecha en la que se recibió la última respuesta
  replies: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'ForumComment', 
    default: [],
  }, // array de IDs de respuestas a este post
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  }, // ID del usuario que creó el post
  type: { 
    type: String, 
    enum: ['post', 'event'], 
    required: true,
  }, // tipo de post, puede ser post o event
  categories: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'PostCategory',
  }, // array de categorías asociadas al post
  banned: {
    type: Boolean,
    default: false,
  } // si el post ha sido baneado por un admin
}, {
  collection: "forum_posts"
});

forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ categories: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
