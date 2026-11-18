export default function FilterBar({ filters, categories, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  return (
    <div className="filters">
      <input placeholder="Search cakes…" value={filters.name} onChange={set('name')} />
      <select value={filters.category} onChange={set('category')}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input type="number" min="0" placeholder="Min $" value={filters.minPrice} onChange={set('minPrice')} />
      <input type="number" min="0" placeholder="Max $" value={filters.maxPrice} onChange={set('maxPrice')} />
    </div>
  );
}
