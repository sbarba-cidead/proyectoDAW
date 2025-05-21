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
    },
    question: { 
        type: String, 
        required: true,
        unique: false,
    },
    category: { 
        type: String, 
        required: true,
        unique: false,
    }, // "carbon-calc" o "water-calc"
    options: { 
        type: [optionSchema], 
        required: true,
        unique: false,
    }
});

module.exports = mongoose.model('EcoQuestion', ecoQuestionSchema);
