// controlador para autenticación de usuarios

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// registro de usuarios
const register = async (req, res) => {
    // recuperación de nombre de usuario, email y contraseña
    const { fullname, username, email, password } = req.body;

    try {
        // comprobación de dirección email
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ msg: 'Ya existe un usuario con ese email' });

        // comprobación de nombre de usuario
        const usernameExists = await User.findOne({ username });
        if (usernameExists) return res.status(400).json({ msg: 'Ya existe un usuario con ese nombre' });

        // encriptación de la contraseña con hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // instanciación de un usuario usando el modelo User
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
        });

        // se guarda el nuevo usuario
        await newUser.save();

        // se devuelve confirmación
        res.status(201).json({ msg: 'Nuevo usuario registrado correctamente' });
    } catch (error) {        
        res.status(500).json({ msg: 'Error al registrar el nuevo usuario' });
        console.log('Error en registro:', error);
    }
};

// inicio de sesión de usuarios
const login = async (req, res) => {
    // se recuperan los datos del usuario para inicio de sesión
    const { credential, password } = req.body;

    try {
        // busca un usuario con ese email o nombre
        const user = await User.findOne({
            $or: [{ email: credential }, { username: credential }]
        });
        if (!user) return res.status(400).json({ msg: 'No existe un usuario con ese email o nombre de usuario' });

        // comprueba si la contraseña es correcta
        const correctPass = await bcrypt.compare(password, user.password);
        if (!correctPass) return res.status(400).json({ msg: 'La contraseña es incorrecta' });

        // crea del token de inicio de sesión
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // respuesta con el token y los datos del usuario
        res.json({ token, user: { id: user._id, avatar: user.avatar, fullname: user.fullname, 
                                    username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ msg: 'Error al iniciar sesión' });
        console.log('Error en inicio de sesión:', error);
    }
};

module.exports = { register, login };
