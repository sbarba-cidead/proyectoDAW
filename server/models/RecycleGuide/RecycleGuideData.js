const mongoose = require('mongoose');

const ecoGuideDataSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
    }, // nombre del producto
    productImage: { 
        type: String, 
        required: true,
    }, // ruta de la imagen del producto
    materials: { 
        type: [String], 
        required: true,
    }, // materiales del producto
    container: { 
        type: String, 
        required: true, 
        unique: true 
    }, // contenedor de reciclaje
    containerImage: { 
        type: String, 
        required: true, 
        unique: true 
    }, // ruta imagen del contenedor
    description: { 
        type: String, 
        required: true, 
    }, // descripción del producto
}, {
    collection: 'recycleguide_data'
});

module.exports = mongoose.model('EcoGuideData', ecoGuideDataSchema);
