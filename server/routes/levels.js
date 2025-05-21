const express = require('express');
const router = express.Router();
const Level = require('../models/Level');

router.get('/get-level/:score', async (req, res) => {
  const score = parseInt(req.params.score);
  try {
    const level = await Level.findOne({
      minScore: { $lte: score },
      maxScore: { $gte: score }
    });

    if (!level) {
      return res.status(404).json({ msg: 'Nivel no encontrado' });
    }

    res.json(level);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
