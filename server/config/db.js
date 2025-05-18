// conexión del servidor con la base de datos en MongoDB

// se utiliza mongoose para la conexión
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // se toma la URI de la BD desde variables de entorno
    const mongoURI = process.env.MONGO_URI;

    // se establece la conexión
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // confirmación en el log
    console.log('Conexión correcta a MongoDB');
  } catch (err) { // si falla la conexión
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
