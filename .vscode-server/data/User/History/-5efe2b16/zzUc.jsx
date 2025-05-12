import { useEffect, useState } from 'react';
import { getRecipes, logout } from './api';
import RecipeEditor from './RecipeEditor';

export default function Dashboard({ setLoggedIn }) {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    getRecipes().then(setRecipes);
  }, []);

  const filteredRecipes = filterTag
    ? recipes.filter(r => r.tags?.toLowerCase().includes(filterTag.toLowerCase()))
    : recipes;

  const uniqueTags = [...new Set(recipes.flatMap(r => r.tags?.split(',').map(t => t.trim().toLowerCase()) || []))];

  return (
    <div className="dashboard">
      <aside>
        <h3>Recipes</h3>
        <button onClick={() => { setSelected(null); setFilterTag(''); }}>+ New Recipe</button>

        <div>
          <strong>Filter by Tag:</strong>
          {uniqueTags.map(tag => (
            <div
              key={tag}
              style={{ cursor: 'pointer', fontWeight: filterTag === tag ? 'bold' : 'normal' }}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </div>
          ))}
          {filterTag && <button onClick={() => setFilterTag('')}>Clear Filter</button>}
        </div>

        {filteredRecipes.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id)}
            style={{ cursor: 'pointer', padding: '4px', marginTop: '4px', background: selected === r.id ? '#ddd' : 'transparent' }}
          >
            {r.title}
          </div>
        ))}
        <button onClick={() => logout().then(() => setLoggedIn(false))}>Logout</button>
      </aside>

      <main>
        <RecipeEditor recipeId={selected} reloadRecipes={() => getRecipes().then(setRecipes)} />
      </main>
    </div>
  );
}

