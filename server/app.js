var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors'); //importa cors
const dotenv = require('dotenv'); // importa variables de entorno
const connectDB = require('./config/db'); //importa db.js para conectar a mongoDB

// importa las rutas
var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
var userRouter = require('./routes/user');
const levelsRouter = require('./routes/levels');
const recycleRouter = require('./routes/recycle');
const forumRouter = require('./routes/forum');
const { domainToASCII } = require('url');

var app = express();

// FIN DE VARIABLES //

// configura variables de entorno
dotenv.config();

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
app.use(express.static(path.join(__dirname, 'public')));


// rutas
app.use('/', indexRouter);
app.use('/api/auth', authRouter) // ruta de autenticación
app.use('/api/user', userRouter); // ruta de sesión usuario
app.use('/api/level', levelsRouter); // ruta de niveles de usuario
app.use('/api/recycle', recycleRouter); // ruta de reciclaje
app.use('/api/forum', forumRouter); // ruta del foro


// // Ruta de prueba
// app.get('/', (req, res) => {
//   res.send('Servidor funcionando');
// });

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
