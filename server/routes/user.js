var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const fsPromises = require('fs/promises');
const Joi = require('joi');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');


// configuración necesaria para guardar archivos en public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const filename = req.body.filename;
    const ext = path.extname(file.originalname);
    cb(null, `${filename}${ext}`);
  }
});

// filtro de seguridad para aceptar solo imágenes
function fileFilter(req, file, cb) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido. Solo se permiten imágenes JPEG o PNG'), false);
  }
}

// subida de la imagen (se limita por seguridad a 10MB de tamaño)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

// función de seguridad para comprobar el formato del nombre de 
// fichero antes de eliminación de avatares antiguos
function sanitizeFilename(name) {
  // solo se permiten letras, números, guiones y guiones bajos
  return name.replace(/[^a-zA-Z0-9-_]/g, '');
}

// validador de datos de usuario
const updateUserSchema = Joi.object({
  avatar: Joi.string().uri().optional(),
  fullname: Joi.string().min(3).max(50).optional(),
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional()
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
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No se ha podido subir el archivo del avatar' });
  }

  try {
    const filename = sanitizeFilename(req.body.filename); // nombre sin extensión
    const fullFilename = req.file.filename; // nombre con extensión
    const currentExt = path.extname(fullFilename); // extensión
    const avatarUrl = `/images/${fullFilename}`;
    const uploadDir = path.join(__dirname, '../public/images');    
    const extensionsToCheck = ['.jpg', '.jpeg', '.png'];

    for (const ext of extensionsToCheck) {
      if (ext !== currentExt) { // si es distinta a la extensión actual
        const filePath = path.join(uploadDir, `${filename}${ext}`);
        if (fs.existsSync(filePath)) {
          await fsPromises.unlink(filePath); // elimina archivos antiguos
        }
      }
    }

    // si son correctas las operaciones se manda el url de subida de la imagen
    res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    res.status(500).json({ msg: 'Error al procesar el avatar en el servidor' });
  }
});

// ruta para actualizar datos de usuario
router.put('/update', authMiddleware, async (req, res) => {
  const userId = req.userId;

  // se recuperan los datos recibidos y se validan
  const { error, value } = updateUserSchema.validate(req.body);

  if (error) { // si hay fallo de validación de datos
    return res.status(400).json({ msg: 'Datos inválidos', details: error.details });
  }

  // verifica url de origen de la imagen del avatar proviene de /public/images
  // if (value.avatar && !value.avatar.startsWith('/images/')) {
  //   return res.status(400).json({ msg: 'URL de avatar inválida' });
  // }

  try {
    // búsqueda y actualización de usuario en BD
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      value,
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
