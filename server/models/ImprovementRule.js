const mongoose = require('mongoose');

const improvementRuleSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('ImprovementRule', improvementRuleSchema);
