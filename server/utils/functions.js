const RecyclingActivity = require('@models/Global/RecyclingActivity');
const mongoose = require('mongoose');


async function recalculateUserScore(userId) {
  if (!userId) throw new Error('userId es requerido');

  // se buscan todas las recycling activities del usuario y se extrae sy scoreValue
  const activities = await RecyclingActivity.find({ userId: userId }, { scoreValue: 1 });

  // se suman todos los scoreValue
  const totalScore = activities.reduce((sum, activity) => {
    return sum + (activity.scoreValue || 0);
  }, 0);

  // se devuelve el valor como int
  return Math.floor(totalScore);
}

module.exports = {
  recalculateUserScore,
};