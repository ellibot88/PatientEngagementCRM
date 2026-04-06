export type FilterType = 'all' | 'unassigned' | 'mine' | 'called' | 'uncalled';

interface FilterBarProps {
  active: FilterType;
  onChange: (f: FilterType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'mine', label: 'Assigned to Me' },
  { key: 'called', label: 'Called' },
  { key: 'uncalled', label: 'Uncalled' },
];

export default function FilterBar({ active, onChange, searchTerm, onSearchChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn${active === f.key ? ' active' : ''}`}
            onClick={() => onChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
