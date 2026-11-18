// All calls go through the API Gateway under /api/<service>/...
const HEADERS = { 'Content-Type': 'application/json', 'X-User-Id': 'demo-user' };

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, { headers: HEADERS, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.details ? `: ${data.details.join(', ')}` : '';
    throw new Error((data.error || 'Request failed') + detail);
  }
  return data;
}

const toQuery = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== '' && v != null && params.set(k, v));
  const s = params.toString();
  return s ? `?${s}` : '';
};

export const api = {
  getCakes: (filters) => request(`/catalog/cakes${toQuery(filters)}`),
  getCategories: () => request('/catalog/cakes/categories'),
  getAverages: () => request('/rating/ratings/averages'),
  rate: (cakeId, score) =>
    request('/rating/ratings', { method: 'POST', body: JSON.stringify({ cakeId, score }) }),
  getBasket: () => request('/order/basket'),
  addToBasket: (cakeId, quantity = 1) =>
    request('/order/basket/items', { method: 'POST', body: JSON.stringify({ cakeId, quantity }) }),
  updateItem: (cakeId, quantity) =>
    request(`/order/basket/items/${cakeId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (cakeId) => request(`/order/basket/items/${cakeId}`, { method: 'DELETE' }),
  checkout: (email) => request('/order/checkout', { method: 'POST', body: JSON.stringify({ email }) }),
};
