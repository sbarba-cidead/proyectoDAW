const mongoose = require('mongoose');

const adviceLevelSchema = new mongoose.Schema({
    max: { 
        type: Number, 
        required: true, 
        unique: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    text: { 
        type: String, 
        required: true,
        unique: false,
    },
});

module.exports = mongoose.model('AdviceLevel', adviceLevelSchema);
