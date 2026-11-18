export default function Header({ count, onOpenBasket }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-icon">🍰</span>
        <span className="brand-name">Cake Delight</span>
      </div>
      <button className="basket-btn" onClick={onOpenBasket}>
        🛒 Basket
        {count > 0 && <span className="badge">{count}</span>}
      </button>
    </header>
  );
}
