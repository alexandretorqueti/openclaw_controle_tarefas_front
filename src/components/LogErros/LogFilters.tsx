import React from 'react';
import { FaCalendarAlt, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { LogFiltersProps } from './types';
import './styles.css';

export const LogFilters: React.FC<LogFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  showFilters,
  onToggleFilters
}) => {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleLevelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      level: value || undefined
    });
  };

  const handleStatusCodeChange = (value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFiltersChange({
      ...filters,
      statusCode: numValue
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value || undefined
    });
  };

  return (
    <div className="log-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          <FaFilter />
          Filtros
        </h3>
        <button className="filters-toggle" onClick={onToggleFilters}>
          <FaTimes />
        </button>
      </div>

      <div className="filters-grid">
        {/* Date Range */}
        <div className="filter-group">
          <label className="filter-label">
            <FaCalendarAlt />
            Período
          </label>
          <div className="date-range">
            <div className="date-input-group">
              <label className="date-label">De:</label>
              <input
                type="date"
                className="date-input"
                value={filters.dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label className="date-label">Até:</label>
              <input
                type="date"
                className="date-input"
                value={filters.dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="filter-group">
          <label className="filter-label">Nível</label>
          <select
            className="filter-select"
            value={filters.level || ''}
            onChange={(e) => handleLevelChange(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>
        </div>

        {/* Status Code Filter */}
        <div className="filter-group">
          <label className="filter-label">Status Code</label>
          <input
            type="number"
            className="filter-input"
            placeholder="Ex: 404, 500"
            value={filters.statusCode || ''}
            onChange={(e) => handleStatusCodeChange(e.target.value)}
          />
        </div>

        {/* Search Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <FaSearch />
            Buscar
          </label>
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar em mensagens..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-actions">
        <button className="filter-button apply" onClick={onApplyFilters}>
          Aplicar Filtros
        </button>
        <button className="filter-button reset" onClick={onResetFilters}>
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};