const mongoose = require('mongoose');

// modelo para puntos de reciclaje en mapa
const mapRecyclePointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    coords: {
        type: [Number],
        required: true,
    },
    containerType: {
        type: String,
        ref: 'ContainerType',
        required: true,
        trim: true,
    },
}, {
    collection: 'recyclemap_points'
});

module.exports = mongoose.model('mapRecyclePoint', mapRecyclePointSchema);
