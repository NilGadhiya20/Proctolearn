import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Download, Filter, MoreVertical } from 'lucide-react';

const ModernTable = ({
  title,
  data = [],
  columns = [],
  onExport,
  searchable = true,
  filterable = false,
  emptyMessage = 'No data available',
  loading = false,
  actions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredData = data.filter(row =>
    searchTerm === '' || columns.some(col =>
      String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-32" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {sortedData.length} {sortedData.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Filter Button */}
            {filterable && (
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Filter size={18} />
              </button>
            )}

            {/* Export Button */}
            {onExport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExport(sortedData)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`
                    px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <ChevronDown
                        size={14}
                        className={`
                          transition-transform duration-200
                          ${sortConfig.key === col.key ? 'text-indigo-600' : 'text-slate-400'}
                          ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'rotate-180' : ''}
                        `}
                      />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <AnimatePresence>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Search size={32} />
                      </div>
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-slate-50 transition-colors duration-200 border-l-4 border-transparent hover:border-indigo-500"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ModernTable;