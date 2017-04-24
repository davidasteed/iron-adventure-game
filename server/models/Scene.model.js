const mongoose = require('mongoose');

let sceneSchema = mongoose.Schema({
  sceneImage: String,
  sceneText: String,
  sceneChoices: [
    {
      choiceIcon: String,
      choiceText: String,
      choiceScore: Number
    }
  ]
});

module.exports = mongoose.model('Scene', sceneSchema);
