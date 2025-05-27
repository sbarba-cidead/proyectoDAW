const mongoose = require('mongoose');

// modelo para puntos de reciclaje en mapa
const RecyclePointSchema = new mongoose.Schema({
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
    containerType: {
        type: String,
        ref: 'ContainerType',
        required: true, 
        unique: false,
    },
}, {
    collection: 'recyclemap_points'
});

module.exports = mongoose.model('RecyclePoint', RecyclePointSchema);
