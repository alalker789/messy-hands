const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(path, options) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
}

export const api = {
  recipes: () => request('/recipes'),
  recipe: (slug) => request(`/recipes/${slug}`),
  createSession: (recipeSlug) => request('/sessions', { method: 'POST', body: JSON.stringify({ recipeSlug }) }),
  getSession: (id) => request(`/sessions/${id}`),
  saveSession: (id, state) => request(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(state) }),
};
