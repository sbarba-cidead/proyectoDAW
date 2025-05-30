// controlador para autenticación de usuarios

const User = require('../models/User');
const UserLevel = require('../models/UserLevel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// registro de usuarios
const register = async (req, res) => {
    // recuperación de nombre de usuario, email y contraseña
    const { fullname, username, email, password } = req.body;

    try {
        // comprobación de dirección email
        const emailExists = await User.findOne({ email });        
        if (emailExists) return res.status(400).json({ error: 'Ya existe un usuario con ese email' });

        // comprobación de nombre de usuario
        const usernameExists = await User.findOne({ username });
        if (usernameExists) return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });

        // encriptación de la contraseña con hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // se busca el nivel principiante
        const beginnerLevel = await UserLevel.findOne({ name: 'beginner' });
        if (!beginnerLevel) {
            return res.status(500).json({ error: 'No se encontró el nivel inicial (beginner)' });
        }

        // instanciación de un usuario usando el modelo User
        const newUser = new User({
            fullname,
            username,
            email,
            level: beginnerLevel._id,
            password: hashedPassword,
        }); // avatar, role, recycleActivities, messages, score toman datos default

        // se guarda el nuevo usuario
        await newUser.save();

        // se devuelve confirmación
        res.status(201).json({ message: 'Nuevo usuario registrado correctamente' });
    } catch (error) {        
        res.status(500).json({ error: 'Error al registrar el nuevo usuario' });
        console.log('Error en registro:', error);
    }
};

// inicio de sesión de usuarios
const login = async (req, res) => {
    // se recuperan los datos del usuario para inicio de sesión
    const { credential, password } = req.body;
    
    try {
        let user = {};

        // busca un usuario con ese email o nombre
        if (credential.includes('@')) {
            user = await User.findOne({ email: credential });
            if (!user) {
                return res.status(400).json({ error: 'EMAIL_NOT_EXISTS' });
            }
        } else {
            user = await User.findOne({ username: credential });
            if (!user) {
                return res.status(400).json({ error: 'USERNAME_NOT_EXISTS' });
            }
        }

        // comprueba si la contraseña es correcta
        const correctPass = await bcrypt.compare(password, user.password);
        if (!correctPass) return res.status(400).json({ error: 'WRONG_PASSWORD' });

        // crea del token de inicio de sesión
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // respuesta con el token y los datos del usuario
        res.json({ token, user: { id: user._id, avatar: user.avatar, fullname: user.fullname, 
                                    username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
        console.log('Error en inicio de sesión:', error);
    }
};

// configuración de nodemailer para recuperación de contraseña
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgotPassword = async (req,res) => {
    const { email } = req.body;

    // validación del email
    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio.' });
    }
    //formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    try {
        // verificación de que el usuario existe
        const user = await User.findOne({ email });

        if (user) {
            // creación de token de recuperación
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            let expiration = 3000;
            // guardado de token de recuperación en la base de datos
            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpires = Date.now() + 10 * 60 * expiration;
            await user.save();

            // url para recuperación de contraseña
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            // email que se recibirá
            const mailOptions = {
                from: `"Puertollano Sostenible" - <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Recuperación de contraseña',
                html: `
                    <p>Hola, ${user.fullname}:</p>
                    <p>¿No recuerdas tu contraseña?</p>
                    <p>Haz clic en el siguiente enlace para recuperarla:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>El enlace tiene una duración de ${expiration/100} minutos.</p>
                `,
            };

            // envío de correo electrónico con el enlace de recuperación
            await transporter.sendMail(mailOptions);
        }

        res.status(200).json({ message: 'Si tu correo electrónico está registrado recibirás un email de recuperación.' });
    } catch (error) {
        console.error('Error en recuperación:', error);
        res.status(500).json({ error: 'Error en el envío de email de recuperación de contraseña.' });
    }
};

const resetPassword = async (req,res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: 'La nueva contraseña es obligatoria.' });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // fecha no expirada, más modernar que ahora
    });

    if (!user) return res.status(400).json({ error: 'Token inválido o expirado.' });

    // encripta la nueva contraseña y la guarda en el usuario
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // limpia campos de token y expiración
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: 'Contraseña restablecida correctamente.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
