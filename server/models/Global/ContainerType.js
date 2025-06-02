const mongoose = require('mongoose');

// modelo para tipos de puntos de reciclaje
const containerTypeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true, 
        trim: true,
    },
    color: {
        type: String,
        required: true, 
        trim: true,
    },
    markerIcon: {
        type: String,
        required: true,
        trim: true,
    },
    markerShadow: {
        type: String,
        default: "marker-shadow.png",
        trim: true,
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    materials: {
        type: [String],
        default: [],
    },
}, {
    collection: 'recycle_container_types'
});

module.exports = mongoose.model('ContainerType', containerTypeSchema);
