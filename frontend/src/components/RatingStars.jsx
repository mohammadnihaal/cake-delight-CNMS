import { useState } from 'react';

// Read-only when onRate is not provided; clickable otherwise.
export default function RatingStars({ value = 0, onRate }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);
  return (
    <span className={`stars ${onRate ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= shown ? 'star on' : 'star'}
          onMouseEnter={() => onRate && setHover(n)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
