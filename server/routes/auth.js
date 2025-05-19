// archivo de rutas de autenticación

// detecta si la petición del cliente es login o registro,
// y llama a la función adecuada del controlador de autenticación

const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

// rutas para autenticación
router.post('/register', register);
router.post('/login', login);

module.exports = router;
