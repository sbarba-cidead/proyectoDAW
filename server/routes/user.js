var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const fsPromises = require('fs/promises');
const Joi = require('joi');
const mongoose = require('mongoose');

// variables de entorno para la ruta de subida de avatars
const AVATAR_UPLOAD_DIR = path.join(__dirname, '..', process.env.AVATAR_UPLOAD_DIR);
const AVATAR_PUBLIC_URL = process.env.AVATAR_PUBLIC_URL;

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');


// configuración necesaria para guardar archivos en public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_UPLOAD_DIR); // dirección a la que se sube la imagen
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
  avatar: Joi.string().pattern(/\.(jpg|jpeg|png)$/i).optional(),
  fullname: Joi.string().pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).min(3).max(50).optional(),
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional()
});


// RUTAS //

// para comprobar si hay conexión con el servidor
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ruta para comprobación de token usuario iniciado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // toma los datos de usuario de la BD
    const user = await User.findById(req.userId)
                            .populate('recyclingActivities')
                            .populate('level')
                            .populate({
                              path: 'messages._id',
                              select: 'title content text post responseTo createdAt model',
                            })
                            .select('avatar fullname username email score level role recyclingActivities messages');
    
    if (!user) { // si no se encuentra el usuario
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // para los mensajes que son replies (ForumComment), 
    // se va a buscar y agregar el título del post padre
    const commentMessageIds = user.messages
      .filter(msg => msg.model === 'ForumComment' && msg._id && msg._id.post)
      .map(msg => msg._id.post);

    if (commentMessageIds.length > 0) {
      // obtiene los posts padre
      const posts = await mongoose.model('ForumPost').find({
        _id: { $in: commentMessageIds }
      }).select('title');

      // mapa para guardar los posts recuperados
      const postsMap = {};
      posts.forEach(post => {
        postsMap[post._id.toString()] = post;
      });

      // se emparejan mensajes con los títulos de sus posts padre
      user.messages.forEach(msg => {
        if (msg.model === 'ForumComment' && msg._id && msg._id.post) {
          const postIdStr = msg._id.post.toString();
          msg._id.post = postsMap[postIdStr] || null;
        }
      });
    }

    // envía la respuesta al front
    res.json(user);
  } catch (error) {    
    res.status(500).json({ error: 'Error del servidor'});
    console.log('Error en el servidor:', error);
  }
});

// ruta para tomar datos de otro usuario para ver su perfil por id
router.post('/otheruser', async (req, res) => {
  try {
      const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Falta el id del usuario' });
    }

    // toma los datos de usuario de la BD
    const user = await User.findById(userId)
                            .populate('recyclingActivities')
                            .populate('level')
                            .populate({
                              path: 'messages._id',
                              select: 'title content text post responseTo createdAt model',
                            })
                            .select('avatar fullname username score level recyclingActivities messages');

    if (!user) { // si no se encuentra el usuario
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    
    // para los mensajes que son replies (ForumComment), 
    // se va a buscar y agregar el título del post padre
    const commentMessageIds = user.messages
      .filter(msg => msg.model === 'ForumComment' && msg._id && msg._id.post)
      .map(msg => msg._id.post);

    if (commentMessageIds.length > 0) {
      // obtiene los posts padre
      const posts = await mongoose.model('ForumPost').find({
        _id: { $in: commentMessageIds }
      }).select('title');

      // mapa para guardar los posts recuperados
      const postsMap = {};
      posts.forEach(post => {
        postsMap[post._id.toString()] = post;
      });

      // se emparejan mensajes con los títulos de sus posts padre
      user.messages.forEach(msg => {
        if (msg.model === 'ForumComment' && msg._id && msg._id.post) {
          const postIdStr = msg._id.post.toString();
          msg._id.post = postsMap[postIdStr] || null;
        }
      });
    }

    // envía la respuesta al front
    res.json(user);
  } catch (error) {    
    res.status(500).json({ error: 'Error del servidor'});
    console.log('Error en el servidor:', error);
  }
});

// ruta para tomar datos de otro usuario para ver su perfil por username
router.get('/otheruser/:username', async (req, res) => {
    try {
      const { username } = req.params;

      if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
        return res.status(400).json({ error: 'Formato de usuario no válido' });
      }

      // toma los datos de usuario de la BD
      const user = await User.findOne({username})
                              .populate('recyclingActivities')
                              .populate('level')
                              .select('avatar fullname username score level recyclingActivities messages');

      if (!user) { // si no se encuentra el usuario
        return res.status(404).json({ error: 'USER_NOT_FOUND' });
      }

      // envía la respuesta al front
      res.json(user);
    } catch (error) {    
      res.status(500).json({ error: 'Error del servidor'});
      console.log('Error en el servidor:', error);
    }
});

// ruta para comprobar si username o email ya existen en otros usuarios
router.post('/check-updated-data', async (req, res) => {
  const { username, email } = req.body;

  try {
    if (username) {
      const userExists = await User.findOne({ username }).lean();
      if (userExists) {
        return res.status(400).json({ error: 'USERNAME_EXISTS' });
      }
    }

    if (email) {
      const emailExists = await User.findOne({ email }).lean();
      if (emailExists) {
        return res.status(400).json({ error: 'EMAIL_EXISTS' });
      }
    }

    return res.status(200).json({ message: 'Datos disponibles' });
  } catch (error) {
    console.error('Error en verificación de duplicados:', error);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// ruta para subir fichero de imagen al servidor
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha podido subir el archivo del avatar' });
  }

  try {
    const filename = sanitizeFilename(req.body.filename); // nombre sin extensión
    const fullFilename = req.file.filename; // nombre con extensión
    const currentExt = path.extname(fullFilename); // extensión
    const avatarUrl = `${AVATAR_PUBLIC_URL}/${fullFilename}`;
    const uploadDir = AVATAR_UPLOAD_DIR;   
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
    res.status(200).json({ avatarUrl, fullFilename });
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    res.status(500).json({ error: 'Error al procesar el avatar en el servidor' });
  }
});

// ruta para actualizar datos de usuario
router.put('/update', authMiddleware, async (req, res) => {
  const userId = req.userId;

  // se recuperan los datos recibidos y se validan
  const { error, value } = updateUserSchema.validate(req.body);

  if (error) { // si hay fallo de validación de datos
    return res.status(400).json({ error: 'Datos inválidos', details: error.details });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const oldUsername = user.username;
    const newUsername = value.username;

    // Si el username ha cambiado y tiene avatar con nombre username
    if (newUsername && oldUsername !== newUsername && user.avatar) {
      const avatarFilename = path.basename(user.avatar); // nombre imagen + extensión
      const ext = path.extname(avatarFilename);          // extensión sólo
      const newFilename = `avatar-${newUsername}${ext}`;

      const oldPath = path.join(AVATAR_UPLOAD_DIR, avatarFilename);
      const newPath = path.join(AVATAR_UPLOAD_DIR, newFilename);

      // renombra el archivo en el sistema
      if (fs.existsSync(oldPath)) {
        await fsPromises.rename(oldPath, newPath); // actualiza nombre fichero
        value.avatar = newFilename; // actualiza en mongo
      }
    }

    // busca y actualiza usuario en BD
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      value,
      { new: true } // devolverá el user actualizado
    ).select('avatar fullname username email');

    if (!updatedUser) { // si no se devuelve user
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // si todo es correcto, se responde con el user actualizado
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// ruta para cambio de contraseña
router.post('/change-password', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // busca usuario en base de datos
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // verificar la contraseña antigua
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'WRONG_CURRENT_PASS' });
    }

    // encriptación de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // actualiza la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error en /change-password:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

module.exports = router;
