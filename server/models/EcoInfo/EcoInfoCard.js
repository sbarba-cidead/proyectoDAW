const mongoose = require('mongoose');

const ecoInfoCardSchema = new mongoose.Schema({
    image: { 
        type: String, 
        required: true,
        trim: true,
    }, // ruta de la imagen en backend
    alt: { 
        type: String, 
        required: true,
        trim: true,
    }, // texto alternativo para imagen
    title: { 
        type: String, 
        required: true,
        trim: true,
    }, // texto de título
    text: { 
        type: String, 
        required: true,
        trim: true,
    }, // texto de contenido
    link: { 
        type: String, 
        required: true,
        trim: true,
    }, // url de enlace
    textlink: { 
        type: String, 
        required: true,
        trim: true,
    }, // texto de la url
}, {
    collection: 'ecoinfo_data'
});

module.exports = mongoose.model('EcoInfoCard', ecoInfoCardSchema);
