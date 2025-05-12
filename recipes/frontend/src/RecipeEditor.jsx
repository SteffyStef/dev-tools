import { useEffect, useState } from 'react';
import { getRecipe, saveRecipe, deleteRecipe } from './api';

export default function RecipeEditor({ recipeId, reloadRecipes }) {
  const [data, setData] = useState({ title: '', ingredients: '', instructions: '', tags: '', image_url: '' });

  useEffect(() => {
    if (recipeId) {
      getRecipe(recipeId).then(setData);
    } else {
      setData({ title: '', ingredients: '', instructions: '', tags: '', image_url: '' });
    }
  }, [recipeId]);

  function handleChange(e) {
    const updatedData = { ...data, [e.target.name]: e.target.value };
  setData(updatedData);
  if (recipeId) {
    saveRecipe(recipeId, updatedData).then(reloadRecipes);
  }
  }

  function handleSave() {
    saveRecipe(recipeId, data).then(reloadRecipes);
  }

  function handleDelete() {
    if (recipeId) deleteRecipe(recipeId).then(() => { reloadRecipes(); setData({}); });
  }

  return (
  <div className="editor">
    <input name="title" placeholder="Title" value={data.title} onChange={handleChange} />
    <textarea name="ingredients" placeholder="Ingredients" value={data.ingredients} onChange={handleChange} />
    <textarea name="instructions" placeholder="Instructions" value={data.instructions} onChange={handleChange} />
    <input name="tags" placeholder="Tags" value={data.tags} onChange={handleChange} />
    <input name="image_url" placeholder="Image URL" value={data.image_url} onChange={handleChange} />

    {data.image_url && (
      <div>
        <p><strong>Image Preview:</strong></p>
        <img src={data.image_url} alt="Recipe" style={{ maxWidth: '300px', marginBottom: '1rem' }} />
      </div>
    )}

    <button onClick={handleSave}>Save</button>
    {recipeId && <button onClick={handleDelete}>Delete</button>}
  </div>
);
}

