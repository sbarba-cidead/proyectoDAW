const mongoose = require('mongoose');

const recyclingActivitySchema = new mongoose.Schema({
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
    }, // id del usuario que la ha realizado
    scoreValue: {
        type: Number,        
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un número entero'
        }
    } // puntos que otorga esta actividad
}, {
    collection: "recycling_activities"
});

module.exports = mongoose.model('RecyclingActivity', recyclingActivitySchema);
