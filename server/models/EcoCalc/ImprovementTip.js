const mongoose = require('mongoose');

const improvementTipSchema = new mongoose.Schema({
    questionId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
    },
    operator: { 
        type: String, 
        required: true,
        enum: ['gte', 'gt', 'eq', 'lte', 'lt', 'neq'],
        trim: true,
    },
    value: { 
        type: Number, 
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    },
    tip: { 
        type: String, 
        required: true,
        trim: true,
    }
}, {
    collection: 'ecocalc_improvement_tips_data'
});

improvementTipSchema.index({ questionId: 1, operator: 1, value: 1 });

module.exports = mongoose.model('ImprovementTip', improvementTipSchema);
