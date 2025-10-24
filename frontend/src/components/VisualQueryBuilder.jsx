import React, { useState } from 'react';
import { X, Plus, Trash2, Play } from 'lucide-react';

const VisualQueryBuilder = ({ isOpen, onClose, onGenerate, schema }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [joins, setJoins] = useState([]);
  const [filters, setFilters] = useState([]);
  const [orderBy, setOrderBy] = useState({ column: '', direction: 'ASC' });
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const tables = schema?.tables || [];
  const currentTableColumns = tables.find(t => t.name === selectedTable)?.columns || [];

  const addFilter = () => {
    setFilters([...filters, { column: '', operator: '=', value: '' }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const toggleColumn = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(c => c !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const generateSQL = () => {
    if (!selectedTable || selectedColumns.length === 0) {
      alert('Please select a table and at least one column');
      return;
    }

    let sql = `SELECT ${selectedColumns.join(', ')}\nFROM ${selectedTable}`;

    // Add filters
    if (filters.length > 0) {
      const whereClauses = filters
        .filter(f => f.column && f.value)
        .map(f => {
          const value = isNaN(f.value) ? `'${f.value}'` : f.value;
          return `${f.column} ${f.operator} ${value}`;
        });

      if (whereClauses.length > 0) {
        sql += `\nWHERE ${whereClauses.join(' AND ')}`;
      }
    }

    // Add order by
    if (orderBy.column) {
      sql += `\nORDER BY ${orderBy.column} ${orderBy.direction}`;
    }

    // Add limit
    if (limit) {
      sql = `SELECT TOP ${limit} ${selectedColumns.join(', ')}\nFROM ${selectedTable}`;
      if (filters.length > 0) {
        const whereClauses = filters
          .filter(f => f.column && f.value)
          .map(f => {
            const value = isNaN(f.value) ? `'${f.value}'` : f.value;
            return `${f.column} ${f.operator} ${value}`;
          });
        if (whereClauses.length > 0) {
          sql += `\nWHERE ${whereClauses.join(' AND ')}`;
        }
      }
      if (orderBy.column) {
        sql += `\nORDER BY ${orderBy.column} ${orderBy.direction}`;
      }
    }

    sql += ';';

    onGenerate(sql);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Visual Query Builder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Table Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Table</label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setSelectedColumns([]);
                setFilters([]);
              }}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="">-- Choose a table --</option>
              {tables.map(table => (
                <option key={table.name} value={table.name}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTable && (
            <>
              {/* Column Selection */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Columns</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (selectedColumns.length === currentTableColumns.length) {
                        setSelectedColumns([]);
                      } else {
                        setSelectedColumns(currentTableColumns);
                      }
                    }}
                    className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    {selectedColumns.length === currentTableColumns.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {currentTableColumns.map(col => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedColumns.includes(col)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Filters (WHERE)</label>
                  <button
                    onClick={addFilter}
                    className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Filter
                  </button>
                </div>

                <div className="space-y-2">
                  {filters.map((filter, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={filter.column}
                        onChange={(e) => updateFilter(idx, 'column', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value="">-- Column --</option>
                        {currentTableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>

                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(idx, 'operator', e.target.value)}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value="=">=</option>
                        <option value="!=">!=</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value=">=">{'≥'}</option>
                        <option value="<=">{'≤'}</option>
                        <option value="LIKE">LIKE</option>
                      </select>

                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(idx, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      />

                      <button
                        onClick={() => removeFilter(idx)}
                        className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order By */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Order By</label>
                <div className="flex gap-2">
                  <select
                    value={orderBy.column}
                    onChange={(e) => setOrderBy({ ...orderBy, column: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- No ordering --</option>
                    {currentTableColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <select
                    value={orderBy.direction}
                    onChange={(e) => setOrderBy({ ...orderBy, direction: e.target.value })}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  >
                    <option value="ASC">ASC</option>
                    <option value="DESC">DESC</option>
                  </select>
                </div>
              </div>

              {/* Limit */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Limit (TOP)</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="Leave empty for no limit"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generateSQL}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Generate SQL
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualQueryBuilder;
