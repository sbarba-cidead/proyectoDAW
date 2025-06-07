const mongoose = require('mongoose');

const postCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
    }, // nombre de la categoría
    postsCount: {
        type: Number,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        },
    } // número de posts que están en esta categoría
}, {
    collection: "forum_post_categories"
});

module.exports = mongoose.model('PostCategory', postCategorySchema);
