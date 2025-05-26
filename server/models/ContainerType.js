const mongoose = require('mongoose');

// modelo para tipos de puntos de reciclaje
const ContainerTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true, 
        unique: true,
    },
    name: {
        type: String,
        required: true, 
        unique: false,
    },
    color: {
        type: String,
        required: true, 
        unique: false,
    },
    markerIcon: {
        type: String,
        required: true,
    },
    markerShadow: {
        type: String,
        required: false,
        default: "marker-shadow.png"
    },
    image: {
        type: String,
        required: true,
    },
    materials: {
        type: [String],
        required: false,
        default: []
    },
}, {
    collection: 'recycle_container_types'
});

module.exports = mongoose.model('ContainerType', ContainerTypeSchema);
