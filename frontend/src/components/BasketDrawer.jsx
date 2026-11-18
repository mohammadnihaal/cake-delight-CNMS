import { useState } from 'react';

export default function BasketDrawer({ open, basket, onClose, onUpdate, onRemove, onCheckout }) {
  const [email, setEmail] = useState('');
  const items = basket?.items || [];

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>Your basket</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <p className="empty">Your basket is empty. Pick a treat! 🍰</p>
        ) : (
          <>
            <ul className="items">
              {items.map((i) => (
                <li key={i.cakeId}>
                  <div>
                    <strong>{i.name}</strong>
                    <small>${i.price.toFixed(2)} each</small>
                  </div>
                  <div className="qty">
                    <button onClick={() => (i.quantity > 1 ? onUpdate(i.cakeId, i.quantity - 1) : onRemove(i.cakeId))}>−</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => onUpdate(i.cakeId, i.quantity + 1)}>+</button>
                    <button className="remove" onClick={() => onRemove(i.cakeId)}>🗑</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="total">
              <span>Total</span>
              <strong>${basket.total.toFixed(2)}</strong>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onCheckout(email);
              }}
            >
              <input
                type="email"
                required
                placeholder="Email for order confirmation"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn wide" type="submit">Checkout</button>
            </form>
          </>
        )}
      </aside>
    </>
  );
}
