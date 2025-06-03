const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: [String], // Array olarak değiştirdim, frontend ile uyumlu olması için
  instructions: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

app.get('/api/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Recipe.findByIdAndDelete(id);
    res.status(200).json({ message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, instructions } = req.body;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { title, ingredients, instructions },
      { new: true }
    );
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
