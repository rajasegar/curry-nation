const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  preference: String,
  type: String,
  cuisine: String,
  servings: Number,
  cookingTime: Number,
  difficulty: String,
  ingredients: String
});
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports =  Recipe;


