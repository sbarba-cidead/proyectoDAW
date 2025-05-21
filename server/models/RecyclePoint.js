const mongoose = require('mongoose');

// modelo para puntos de reciclaje en mapa
const RecyclePointSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true, 
        unique: true,
    },
    name: {
        type: String,
        required: true, 
        unique: false,
    },
    coords: {
        type: [Number],
        required: true,
        unique: false,
    },
    type: {
        type: String,
        required: true, 
        unique: false,
    },
});

module.exports = mongoose.model('RecyclePoint', RecyclePointSchema);
