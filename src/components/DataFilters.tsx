interface DataFiltersProps {
  locations: string[];
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

export default function DataFilters({
  locations,
  selectedLocation,
  onLocationChange,
  selectedDate,
  onDateChange,
}: DataFiltersProps) {
  return (
    <div className="data-filters">
      <div className="filter-group">
        <label className="filter-label">Location</label>
        <select
          className="filter-select"
          value={selectedLocation ?? ''}
          onChange={(e) => onLocationChange(e.target.value || null)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="filter-label">Appointment Date</label>
        <div className="date-filter-row">
          <input
            type="date"
            className="filter-date-input"
            value={selectedDate ?? ''}
            onChange={(e) => onDateChange(e.target.value || null)}
          />
          {selectedDate && (
            <button className="btn-clear" onClick={() => onDateChange(null)}>Clear</button>
          )}
        </div>
      </div>
    </div>
  );
}
