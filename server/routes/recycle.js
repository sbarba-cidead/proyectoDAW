const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MapRecyclePoint = require('../models/Map/MapRecyclePoint');
const ContainerType = require('../models/ContainerType');
const EcoQuestion = require('../models/EcoQuestion');
const AdviceLevel = require('../models/AdviceLevel');
const EcoInfoCard = require('../models/EcoInfo/EcoInfoCard');
const RecycleGuideData = require('../models/RecycleGuide/RecycleGuideData');
const UserLevel = require('../models/UserLevel');
const User = require('../models/User')
const RecyclingActivity = require('../models/RecyclingActivity');
const ImprovementTip = require('../models/ImprovementTip');

// para comprobar si hay conexión con el servidor
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// almacenamiento de actividades de reciclaje
router.post('/save-recycling-activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.body;
    if (!type ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Crear la actividad
    const newRecyclingActivity = new RecyclingActivity({
      type,
      date: new Date(),
      userId
    });

    const savedRecyclingActivity = await newRecyclingActivity.save();

    // Actualizar el usuario añadiendo la referencia a la actividad
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { recyclingActivities: savedRecyclingActivity._id } },
      { new: true }
    ).populate('recyclingActivities');

    // recalcula score del usuario (5 puntos por actividad)
    const newScore = parseInt(user.recyclingActivities.length * 5, 10);

    // actualiza score del usuario
    user.score = newScore;    

    // busca el nivel de usuario (userlevel) adecuado para los puntos (score)
    const userLevel = await UserLevel.findOne({
      minScore: { $lte: newScore },
      maxScore: { $gte: newScore }
    });

    // guarda la referencia al nivel
    if (userLevel) {
      user.level = userLevel._id;
    }

    // actualiza usuario en BD con todos los nuevos datos
    await user.save();

    res.status(201).json({ 
      message: 'Actividad guardada', 
      recyclingActivity: savedRecyclingActivity,
      newScore: user.score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error guardando la actividad' });
  }
});

// puntos de reciclaje para el mapa
router.get('/recycle-points', async (req, res) => {
  try {
    const points = await MapRecyclePoint.find({})
                                        .populate('containerType')
                                        .lean();

    res.json(points);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los puntos de reciclaje' });
  }
});

// datos sobre tipos de contenedores de reciclaje
router.get('/container-types', async (req, res) => {
  try {
    const types = await ContainerType.find().lean();

    res.json(types);
  } catch (error) {
    console.error('Error al recuperar tipos de contenedor:', error);
    res.status(500).json({ error: 'Error al recuperar tipos de contenedor' });
  }
});

// datos de preguntas para la calculadora de huella ecológica
router.get('/eco-questions', async (req, res) => {
  // se va a filtrar por las caterogías que se indiquen en la petición
  const categories = req.query.categories?.split(',') || [];

  const filter = categories.length > 0
    ? { category: { $in: categories } }
    : {};

  try {
    const questions = await EcoQuestion.find(filter).lean();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
});

// niveles de huella ecológica para consejos de mejora
router.get('/eco-advice-levels', async (req, res) => {
  try {
    const levels = await AdviceLevel.find({}).lean();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los niveles de consejo' });
  }
});

// consejos de mejora para la huella ecológica
router.get('/eco-improvement-rules', async (req, res) => {
  try {
    const rules = await ImprovementTip.find({}).lean();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reglas de mejora' });
  }
});

// información para las tarjetas de la página ecoinfo
router.get('/eco-info-cards', async (req, res) => {
    try {
        const cards = await EcoInfoCard.find().lean();
        res.status(200).json(cards);
    } catch (error) {
        console.error('Error al obtener los datos para ecoinfo:', error);
        res.status(500).json({ error: 'Error al obtener los datos para ecoinfo' });
    }
});

// datos para la guía de reciclaje en contenedores
router.get('/eco-guide-data', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const search = req.query.search || '';
    console.log('Search:', search)
    try {
        const regex = new RegExp(search, 'i');

                // DEPURACIÓN: imprime todo lo que hay en la colección
        const allData = await RecycleGuideData.find({}).lean();
        console.log("Todos los productos en la colección:", allData.map(p => p.name));

        const products = await RecycleGuideData.find({
           // busca por coincidencia parcial, case-insensitive
            // name: { $regex: search, $options: 'i' }
            name: regex
        }).sort({ name: 1 }).lean();


        console.log("Productos encontrados:", products.map(p => p.name));


        res.json(products);
    } catch (error) {
        console.error('Error al obtener datos de reciclaje:', error);
        res.status(500).json({ error: 'Error al obtener datos de reciclaje' });
    }
});


module.exports = router;
