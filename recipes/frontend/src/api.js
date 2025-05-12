const base = 'http://54.185.142.99:3001/api';
const opts = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };

export const login = (email, password) => fetch(`${base}/login`, { ...opts, method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (email, password) => fetch(`${base}/register`, { ...opts, method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () => fetch(`${base}/logout`, { ...opts, method: 'POST' });
export const getRecipes = () => fetch(`${base}/recipes`, opts).then(r => r.json());
export const getRecipe = (id) => fetch(`${base}/recipes/${id}`, opts).then(r => r.json());
export const saveRecipe = (id, data) =>
  fetch(`${base}/recipes${id ? '/' + id : ''}`, {
    ...opts,
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(data)
  });
export const deleteRecipe = (id) => fetch(`${base}/recipes/${id}`, { ...opts, method: 'DELETE' });

