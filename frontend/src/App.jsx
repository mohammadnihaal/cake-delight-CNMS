import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import CakeCard from './components/CakeCard.jsx';
import BasketDrawer from './components/BasketDrawer.jsx';
import RatingStars from './components/RatingStars.jsx';
import Toast from './components/Toast.jsx';

const EMPTY_FILTERS = { name: '', category: '', minPrice: '', maxPrice: '' };

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [averages, setAverages] = useState({});
  const [basket, setBasket] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [order, setOrder] = useState(null); // confirmed order -> rating modal
  const [rated, setRated] = useState({});
  const [toast, setToast] = useState(null);

  const notify = (text, type = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAverages = useCallback(async () => {
    try {
      const rows = await api.getAverages();
      setAverages(Object.fromEntries(rows.map((r) => [r.cakeId, r])));
    } catch {
      /* ratings are optional for browsing */
    }
  }, []);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBasket().then(setBasket).catch(() => {});
    loadAverages();
  }, [loadAverages]);

  // Re-query the catalog whenever filters change (small debounce for typing)
  useEffect(() => {
    const t = setTimeout(() => {
      api.getCakes(filters).then(setCakes).catch((e) => notify(e.message, 'err'));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const run = (fn, okMsg) => async (...args) => {
    try {
      const result = await fn(...args);
      if (okMsg) notify(okMsg);
      return result;
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const addToBasket = run(async (cake) => setBasket(await api.addToBasket(cake._id)), 'Added to basket');
  const updateItem = run(async (id, q) => setBasket(await api.updateItem(id, q)));
  const removeItem = run(async (id) => setBasket(await api.removeItem(id)));

  const checkout = run(async (email) => {
    const confirmed = await api.checkout(email);
    setOrder(confirmed);
    setRated({});
    setDrawerOpen(false);
    setBasket(await api.getBasket());
  });

  const rate = run(async (cakeId, score) => {
    await api.rate(cakeId, score);
    setRated((r) => ({ ...r, [cakeId]: score }));
    loadAverages();
  }, 'Thanks for rating!');

  const count = basket?.items?.reduce((n, i) => n + i.quantity, 0) || 0;

  return (
    <>
      <Header count={count} onOpenBasket={() => setDrawerOpen(true)} />
      <main className="container">
        <section className="hero">
          <h1>Freshly baked happiness</h1>
          <p>Browse our cakes, build your basket and treat yourself.</p>
        </section>

        <FilterBar filters={filters} categories={categories} onChange={setFilters} />

        {cakes.length === 0 ? (
          <p className="empty">No cakes match your filters.</p>
        ) : (
          <div className="grid">
            {cakes.map((c) => (
              <CakeCard key={c._id} cake={c} rating={averages[c._id]} onAdd={addToBasket} />
            ))}
          </div>
        )}
      </main>

      <BasketDrawer
        open={drawerOpen}
        basket={basket}
        onClose={() => setDrawerOpen(false)}
        onUpdate={updateItem}
        onRemove={removeItem}
        onCheckout={checkout}
      />

      {order && (
        <div className="overlay center" onClick={() => setOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-emoji">🎉</div>
            <h2>Order confirmed!</h2>
            <p>
              A confirmation email is on its way to <strong>{order.email}</strong>.
              <br />
              Total paid: <strong>${order.total.toFixed(2)}</strong>
            </p>
            <h4>Rate your cakes</h4>
            <ul className="rate-list">
              {order.items.map((i) => (
                <li key={i.cakeId}>
                  <span>{i.name}</span>
                  {rated[i.cakeId] ? (
                    <RatingStars value={rated[i.cakeId]} />
                  ) : (
                    <RatingStars onRate={(s) => rate(i.cakeId, s)} />
                  )}
                </li>
              ))}
            </ul>
            <button className="btn wide" onClick={() => setOrder(null)}>Done</button>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </>
  );
}
