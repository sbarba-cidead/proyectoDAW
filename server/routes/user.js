var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');


// configuración necesaria para guardar archivos en public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const username = req.body.username;
    const ext = path.extname(file.originalname);
    cb(null, `${username}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no permitido'));
    }
  }
});

// RUTAS //

// ruta para comprobación de token usuario iniciado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // toma el nombre de usuario y el avatar del usuario de la BD
    const user = await User.findById(req.userId)
                            .select('fullname username email avatar score');

    if (!user) { // si no se encuentra el usuario
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // envía la respuesta al front
    res.json(user);
  } catch (error) {    
    res.status(500).json({ msg: 'Error del servidor'});
    console.log('Error en el servidor:', error);
  }
});

// ruta para subir fichero de imagen al servidor
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No se ha podido subir el archivo del avatar' });
  }

  const filename = req.file.filename;
  const avatarUrl = `/images/${filename}`;

  // si es correcta la subida se manda el url de subida de la imagen
  res.status(200).json({ avatarUrl });
});

// ruta para actualizar datos de usuario
router.put('/update', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { avatar, fullname, username, email } = req.body;

  try {
    // búsqueda y actualización de usuario en BD
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar,
        fullname,
        username,
        email,
      },
      { new: true } // devolverá el user actualizado
    ).select('avatar fullname username email');

    if (!updatedUser) { // si no se devuelve user
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // si todo es correcto, se responde con el user actualizado
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ msg: 'Error al actualizar el usuario' });
  }
});

module.exports = router;
