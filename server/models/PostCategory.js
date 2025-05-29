const mongoose = require('mongoose');

const postCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }, // nombre de la categoría
}, {
    collection: "forum-post-categories"
});

module.exports = mongoose.model('PostCategory', postCategorySchema);
