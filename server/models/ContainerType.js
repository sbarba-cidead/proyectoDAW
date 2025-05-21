const mongoose = require('mongoose');

// modelo para tipos de puntos de reciclaje
const ContainerTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true, 
        unique: true,
    },
    label: {
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
        unique: false,
    },
    markerShadow: {
        type: String,
        required: false, 
        unique: false,
        default: "marker-shadow.png"
    },
});

module.exports = mongoose.model('ContainerType', ContainerTypeSchema);
