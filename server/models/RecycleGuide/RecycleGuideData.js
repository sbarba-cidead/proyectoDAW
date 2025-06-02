const mongoose = require('mongoose');

const recycleGuideDataSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
    }, // nombre del producto
    productImage: { 
        type: String, 
        required: true,
        trim: true,
    }, // ruta de la imagen del producto
    materials: { 
        type: [String], 
        required: true,
    }, // materiales del producto
    container: { 
        type: String, 
        required: true,
        trim: true,
    }, // contenedor de reciclaje
    containerImage: { 
        type: String, 
        required: true,
        trim: true,
    }, // ruta imagen del contenedor
    description: { 
        type: String, 
        required: true, 
        trim: true,
    }, // descripción del producto
}, {
    collection: 'recycleguide_data'
});

recycleGuideDataSchema.index({ name: 1 });

module.exports = mongoose.model('RecycleGuideData', recycleGuideDataSchema);
