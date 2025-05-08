import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';

function Dashboard() {
  const [presetRecipes, setPresetRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [recipe, setRecipe] = useState({ name: '', ingredients: [] });
  const [ingredient, setIngredient] = useState(''); // For adding individual ingredients

  // Fetch preset recipes from the backend
  const fetchPresetRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recipes');
      setPresetRecipes(response.data);
    } catch (error) {
      console.error('Error fetching preset recipes:', error);
    }
  };

  // Fetch user recipes from the backend
  const fetchUserRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user_recipes');
      setUserRecipes(response.data);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  // Handle input changes for recipe name
  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding an ingredient
  const handleAddIngredient = () => {
    if (ingredient.trim()) {
      setRecipe((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient],
      }));
      setIngredient(''); // Clear the input field
    }
  };

  // Handle removing an ingredient
  const handleRemoveIngredient = (index) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission to save a new recipe
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/user_recipes', recipe);
      setUserRecipes((prev) => [...prev, response.data]); // Add the new recipe to the list
      setRecipe({ name: '', ingredients: [] }); // Reset the form
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  // Handle deleting a recipe
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/user_recipes/${id}`);
      setUserRecipes((prev) => prev.filter((recipe) => recipe._id !== id)); // Remove the deleted recipe from the list
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  // Handle updating a recipe
  const handleUpdate = async (id) => {
    try {
      const updatedRecipe = { name: 'Updated Recipe', ingredients: ['Updated Ingredient'] }; // Example data
      const response = await axios.put(`http://localhost:5000/api/user_recipes/${id}`, updatedRecipe);
      setUserRecipes((prev) =>
        prev.map((recipe) => (recipe._id === id ? response.data : recipe))
      ); // Update the recipe in the list
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  // Handle saving a preset recipe to user recipes
  const handleSavePresetRecipe = async (presetRecipe) => {
    try {
      // Copy the preset recipe into the user recipes collection
      const response = await axios.post('http://localhost:5000/api/user_recipes', presetRecipe);
      setUserRecipes((prev) => [...prev, response.data]); // Add the preset recipe to the user recipes list
    } catch (error) {
      console.error('Error saving preset recipe:', error);
    }
  };

  // Fetch recipes when the component mounts
  useEffect(() => {
    fetchPresetRecipes();
    fetchUserRecipes();
  }, []);

  return (
    <div id="Dashboard">
      <header>
        <h1>Recipe Saver</h1>
      </header>
      <main>
        {/* Preset Recipes Section */}
        <section className="preset-recipes">
          <h2>Preset Recipes</h2>
          <ul>
            {presetRecipes.map((recipe, index) => (
              <li key={index}>
                <h3>{recipe.name}</h3>
                <p>Ingredients: {recipe.ingredients.join(', ')}</p>
                <button onClick={() => handleSavePresetRecipe(recipe)}>Save to My Recipes</button>
              </li>
            ))}
          </ul>
        </section>

        {/* User Recipes Section */}
        <section className="user-recipes">
          <h2>Create a Recipe</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={recipe.name}
              onChange={handleRecipeChange}
              placeholder="Recipe Name"
              required
            />
            <div>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="Add Ingredient"
              />
              <button type="button" onClick={handleAddIngredient}>
                Add Ingredient
              </button>
            </div>
            <ul>
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {ing}{' '}
                  <button type="button" onClick={() => handleRemoveIngredient(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button type="submit">Save Recipe</button>
          </form>
        </section>

        {/* Saved User Recipes Section */}
        <section className="saved-recipes">
          <h2>Saved User Recipes</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userRecipes.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.ingredients.join(', ')}</td>
                  <td>
                    <button onClick={() => handleUpdate(r._id)}>Edit</button>
                    <button onClick={() => handleDelete(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;