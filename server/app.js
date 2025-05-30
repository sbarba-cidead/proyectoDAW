const dotenv = require('dotenv').config(); // importa variables de entorno
const dotenvFlow = require('dotenv-flow').config(); // controla modos para variables de entorno
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); //importa cors
const connectDB = require('./config/db'); //importa db.js para conectar a mongoDB

const { domainToASCII } = require('url');

// importa las rutas
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const recycleRouter = require('./routes/recycle');
const forumRouter = require('./routes/forum');

var app = express();

// FIN DE VARIABLES //

// conectar a base de datos
connectDB();

// configuración del motor
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(cors()); // evita bloqueo cors
app.use(logger('dev'));
app.use(express.json()); // activación de compatibilidad con json para express
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // carpeta pública

// rutas
app.use('/api/auth', authRouter) // ruta de autenticación
app.use('/api/user', userRouter); // ruta de sesión usuario
app.use('/api/recycle', recycleRouter); // ruta de reciclaje
app.use('/api/forum', forumRouter); // ruta del foro


// ------------------//
// manejo de errores //

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
