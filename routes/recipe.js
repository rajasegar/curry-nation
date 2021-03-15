const Recipe = require('../models/recipe');

exports.show =  async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);
  res.render('recipe', { recipe  });
};

exports.edit =  async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);
  res.render('edit-recipe', { recipe  });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);

  try {
    await recipe.update(req.body);
    console.log('recipe updated');
  } catch(err) {
    console.log(err);
  }

  res.redirect('/home');

};

exports.create = async (req, res) => {
  const recipe = new Recipe(req.body);

  try {
    await recipe.save();
    console.log('recipe created');
  } catch(err) {
    console.log(err);
  }

  res.redirect('/home');

};

