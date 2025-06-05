import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUtensils } from "react-icons/fa";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    ingredients: "",
    instructions: "",
  });
  const [editingRecipe, setEditingRecipe] = useState(null); // Düzenlenen tarifi tutar

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/recipes/${id}`);
      fetchRecipes(); // Tarifleri yeniden yükle
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const startEditing = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title,
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(", ")
        : recipe.ingredients,
      instructions: recipe.instructions,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.ingredients || !formData.instructions) return;

    try {
      if (editingRecipe) {
        // Düzenleme varsa PUT isteği gönder
        await axios.put(`http://localhost:5000/api/recipes/${editingRecipe._id}`, {
          title: formData.title,
          ingredients: formData.ingredients.split(",").map((i) => i.trim()),
          instructions: formData.instructions,
        });
        setEditingRecipe(null);
      } else {
        // Yeni tarif ekleme POST isteği
        await axios.post("http://localhost:5000/api/recipes", {
          title: formData.title,
          ingredients: formData.ingredients.split(",").map((i) => i.trim()),
          instructions: formData.instructions,
        });
      }
      fetchRecipes();
      setFormData({ title: "", ingredients: "", instructions: "" });
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaUtensils className="text-3xl text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-800">Recipe Manager</h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4 mb-10"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="p-2 border rounded-md"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients (comma-separated)"
            className="p-2 border rounded-md"
            value={formData.ingredients}
            onChange={handleChange}
          />
          <textarea
            name="instructions"
            placeholder="Instructions"
            className="p-2 border rounded-md h-24 resize-none"
            value={formData.instructions}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              {editingRecipe ? "Update Recipe" : "Add Recipe"}
            </button>
            {editingRecipe && (
              <button
                type="button"
                onClick={() => {
                  setEditingRecipe(null);
                  setFormData({ title: "", ingredients: "", instructions: "" });
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Recipe List */}
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="bg-white p-4 rounded-md shadow">
              <h2 className="text-xl font-semibold text-gray-800">{recipe.title}</h2>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Ingredients:</strong>{" "}
                {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}
              </p>
              <p className="text-gray-700 mt-2">{recipe.instructions}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => startEditing(recipe)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRecipe(recipe._id)}
                  className="text-red-600 hover:text-red-800 font-semibold py-1 px-3 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
