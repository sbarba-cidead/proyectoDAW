const mongoose = require('mongoose');
const { Schema } = mongoose;

const forumCommentSchema = new Schema({
  id: {
    type: Number, 
    required: true,
    unique: true
  }, // id incremental autogenerado
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }, // referencia al post padre
  responseTo: {
    type: String,
    default: null
  }, // string con el id del mensaje al que es respuesta, o null si no es respuesta
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
});

module.exports = mongoose.model('ForumComment', forumCommentSchema);
