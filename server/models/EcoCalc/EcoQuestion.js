const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true }
});

const ecoQuestionSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
    },
    question: { 
        type: String, 
        required: true,
        trim: true,
    },
    category: { 
        type: String, 
        required: true,
        trim: true,
    }, // "carbon-calc" o "water-calc"
    options: { 
        type: [optionSchema], 
        required: true,
    }
}, {
    collection: 'ecocalc_questions_data'
});

ecoQuestionSchema.index({ category: 1 });

module.exports = mongoose.model('EcoQuestion', ecoQuestionSchema);
