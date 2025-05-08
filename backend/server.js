const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://alexanderle0324:RecipeSaverFinalProject@cluster0.btcthmg.mongodb.net/Recipemanager?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

//the two models are preset recipies and user recipes, one has preset data that doesn't change and one has data that users can add, basically creating their own recipes
const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true }
});

const userRecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true }
});
    
const Recipe = mongoose.model('Recipe', recipeSchema);
const UserRecipe = mongoose.model('UserRecipe', userRecipeSchema);

//this is a preset of reciples, they don't change
const presetRecipes = [
    { 
        name: 'Spaghetti Bolognese', 
        ingredients: ['Spaghetti', 'Ground Beef', 'Tomato Sauce'],
    },
    { 
        name: 'Chicken Curry', 
        ingredients: ['Chicken', 'Curry Powder', 'Coconut Milk'],
    },
    { 
        name: 'Vegetable Stir Fry', 
        ingredients: ['Broccoli', 'Carrots', 'Soy Sauce'],
    },
    { 
        name: 'Pancakes', 
        ingredients: ['Flour', 'Eggs', 'Milk'],

    },
    { 
        name: 'Caesar Salad', 
        ingredients: ['Romaine Lettuce', 'Croutons', 'Caesar Dressing'],
   
    }
];


//insert preset recipes if the collection is empty
mongoose.connection.once('open', async () => {
    const count = await Recipe.countDocuments();
    if (count === 0) {
        await Recipe.insertMany(presetRecipes);
        console.log('Preset recipes added to the database');
    }
});

//middleware to log requests
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});

// Get all preset recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.status(200).json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Create a new user recipe
app.post('/api/user_recipes', async (req, res) => {
    try {
        const { name, ingredients } = req.body;
        const newRecipe = new UserRecipe({ name, ingredients });
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all user recipes
app.get('/api/user_recipes', async (req, res) => {
    try {
        const recipes = await UserRecipe.find();
        res.status(200).json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a user recipe by ID
app.put('/api/user_recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, ingredients } = req.body;
        const updatedRecipe = await UserRecipe.findByIdAndUpdate(
            id,
            { name, ingredients },
            { new: true, runValidators: true }
        );
        if (!updatedRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.status(200).json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a user recipe by ID
app.delete('/api/user_recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRecipe = await UserRecipe.findByIdAndDelete(id);
        if (!deletedRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));  