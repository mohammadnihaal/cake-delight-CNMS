import RatingStars from './RatingStars.jsx';

const LOOKS = {
  Chocolate: { emoji: '🍫', bg: 'linear-gradient(135deg,#f3d9c9,#e7b9a0)' },
  Classic: { emoji: '🎂', bg: 'linear-gradient(135deg,#ffe0e9,#ffc2d4)' },
  Fruit: { emoji: '🍓', bg: 'linear-gradient(135deg,#ffe3d6,#ffc9b3)' },
  Cheesecake: { emoji: '🧁', bg: 'linear-gradient(135deg,#fdf0d2,#f7dca0)' },
  Loaf: { emoji: '🍋', bg: 'linear-gradient(135deg,#fbf6c9,#f1e78f)' },
};
const DEFAULT_LOOK = { emoji: '🍰', bg: 'linear-gradient(135deg,#ffe8ef,#ffd1de)' };

export default function CakeCard({ cake, rating, onAdd }) {
  const look = LOOKS[cake.category] || DEFAULT_LOOK;
  return (
    <article className="card">
      <div className="card-img" style={{ background: look.bg }}>
        <span>{look.emoji}</span>
        <span className="chip">{cake.category}</span>
      </div>
      <div className="card-body">
        <h3>{cake.name}</h3>
        <p className="desc">{cake.description}</p>
        <div className="rating-row">
          <RatingStars value={rating?.average || 0} />
          <small>{rating?.count ? `${rating.average} (${rating.count})` : 'No ratings yet'}</small>
        </div>
        <div className="card-foot">
          <span className="price">${cake.price.toFixed(2)}</span>
          <button className="btn" disabled={!cake.available} onClick={() => onAdd(cake)}>
            {cake.available ? 'Add to basket' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
