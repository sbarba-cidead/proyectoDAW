const mongoose = require('mongoose');

const RecyclingActivitySchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true 
    }, // texto que describre la actividad
    date: { 
        type: Date, 
        required: true, 
        default: Date.now 
    }, // fecha de cuando se ha realizado
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    } // id del usuario que la ha realizado
}, {
    collection: "recycling_activities"
});

module.exports = mongoose.model('RecyclingActivity', RecyclingActivitySchema);
