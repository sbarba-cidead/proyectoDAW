const express = require('express');
const router = express.Router();
const RecyclePoint = require('../models/RecyclePoint');
const ContainerType = require('../models/ContainerType');
const EcoQuestion = require('../models/EcoQuestion');
const AdviceLevel = require('../models/AdviceLevel');
const EcoInfoCard = require('../models/EcoInfoCard');
const ImprovementRule = require('../models/ImprovementRule');


// puntos de reciclaje para el mapa
router.get('/recycle-points', async (req, res) => {
  try {
    const points = await RecyclePoint.find({});
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los puntos de reciclaje' });
  }
});

// datos sobre tipos de contenedores de reciclaje
router.get('/container-types', async (req, res) => {
  try {
    const types = await ContainerType.find().lean();

    console.log(types);

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
    const questions = await EcoQuestion.find(filter);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
});

// niveles de huella ecológica para consejos de mejora
router.get('/eco-advice-levels', async (req, res) => {
  try {
    const levels = await AdviceLevel.find({});
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los niveles de consejo' });
  }
});

// consejos de mejora para la huella ecológica
router.get('/eco-improvement-rules', async (req, res) => {
  try {
    const rules = await ImprovementRule.find({});
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reglas de mejora' });
  }
});

// información para las tarjetas de la página ecoinfo
router.get('/eco-info-cards', async (req, res) => {
    try {
        const cards = await EcoInfoCard.find();
        res.status(200).json(cards);
    } catch (error) {
        console.error('Error al obtener los datos para ecoinfo:', error);
        res.status(500).json({ message: 'Error al obtener los datos para ecoinfo' });
    }
});


module.exports = router;
