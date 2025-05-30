const mongoose = require('mongoose');
const { Schema } = mongoose;

const forumCommentSchema = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  }, // referencia al post padre
  responseTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumComment',
    default: null,
    required: false
  }, // string con el id del mensaje al que es respuesta, o null si no es respuesta
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, // referencia al usuario creador del mensaje
  createdAt: {
    type: Date,
    default: Date.now
  }, // fecha de creación del mensaje
  text: {
    type: String,
    required: true
  } // contenido del mensaje
}, {
  collection: "forum_comments"
});

module.exports = mongoose.model('ForumComment', forumCommentSchema);
