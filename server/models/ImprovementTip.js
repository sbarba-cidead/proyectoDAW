const mongoose = require('mongoose');

const improvementTipSchema = new mongoose.Schema({
    questionId: { 
        type: String, 
        required: true, 
        unique: true,
    },
    operator: { 
        type: String, 
        required: true,
        unique: false,
    },
    value: { 
        type: Number, 
        required: true,
        unique: false,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    tip: { 
        type: String, 
        required: true,
        unique: false,
    }
}, {
    collection: 'ecocalc_improvement_tips_data'
});

module.exports = mongoose.model('ImprovementTip', improvementTipSchema);
