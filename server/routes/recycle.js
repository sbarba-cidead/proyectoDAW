const express = require('express');
const router = express.Router();
const RecyclePoint = require('../models/RecyclePoint');
const ContainerType = require('../models/ContainerType');
const EcoQuestion = require('../models/EcoQuestion');

// puntos de reciclaje para el mapa
router.get('/recycle-points', async (req, res) => {
  try {
    const points = await RecyclePoint.find({});
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los puntos de reciclaje' });
  }
});

// datos sobre tipos de contenedores de reciclaje
router.get('/container-types', async (req, res) => {
  try {
    const types = await ContainerType.find().lean();

    console.log(types);

    res.json(types);
  } catch (err) {
    console.error('Error al recuperar tipos de contenedor:', err);
    res.status(500).json({ error: 'Error al recuperar tipos de contenedor' });
  }
});

router.get('/eco-questions', async (req, res) => {
  // se va a filtrar por las caterogías que se indiquen en la petición
  const categories = req.query.categories?.split(',') || [];

  const filter = categories.length > 0
    ? { category: { $in: categories } }
    : {};

  try {
    const questions = await EcoQuestion.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
});

module.exports = router;
