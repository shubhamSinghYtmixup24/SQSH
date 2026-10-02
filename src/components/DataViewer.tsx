import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { store, Product, LedgerEntry } from '../store';

export default function DataViewer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [chartType, setChartType] = useState('bar');
  const [dataSource, setDataSource] = useState('products');
  const [aggregation, setAggregation] = useState('sum');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showTotals, setShowTotals] = useState(true);

  useEffect(() => {
    setProducts(store.getProducts());
    setLedger(store.getLedger());
  }, []);

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  // Prepare data for visualization
  const prepareChartData = () => {
    if (dataSource === 'products') {
      return products.slice(0, 10).map(p => ({
        name: p.name.substring(0, 12),
        value: aggregation === 'sum' ? p.stockLevel : aggregation === 'avg' ? p.sellingPrice : p.unitCost,
        price: p.sellingPrice,
        stock: p.stockLevel,
      }));
    } else {
      const grouped: Record<string, { debit: number; credit: number }> = {};
      ledger.forEach(l => {
        if (!grouped[l.accountType]) grouped[l.accountType] = { debit: 0, credit: 0 };
        grouped[l.accountType].debit += l.debit;
        grouped[l.accountType].credit += l.credit;
      });
      return Object.entries(grouped).map(([name, data]) => ({
        name, debit: data.debit, credit: data.credit, value: data.credit - data.debit
      }));
    }
  };

  const chartData = prepareChartData();

  const sortedData = [...chartData].sort((a, b) => {
    if (sortOrder === 'asc') return a.value > b.value ? 1 : -1;
    return a.value < b.value ? 1 : -1;
  });

  const total = sortedData.reduce((s, d) => s + d.value, 0);

  const exportData = (format: string) => {
    let content = '';
    if (format === 'csv') {
      const headers = Object.keys(sortedData[0] || {}).join(',');
      const rows = sortedData.map(d => Object.values(d).join(','));
      content = [headers, ...rows].join('\n');
    } else if (format === 'json') {
      content = JSON.stringify(sortedData, null, 2);
    }
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `data-viewer-export.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis tick={{fontSize: 11}} />
              <Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {sortedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis tick={{fontSize: 11}} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{r: 5}} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis tick={{fontSize: 11}} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorGradient)" />
              <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={sortedData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {sortedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" name="Category" tick={{fontSize: 11}} />
              <YAxis dataKey="value" name="Value" tick={{fontSize: 11}} />
              <Tooltip cursor={{strokeDasharray: '3 3'}} />
              <Scatter data={sortedData} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Viewer & Analysis</h2>
          <p className="text-gray-500 text-sm">Visualize, analyze and export your data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportData('csv')} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">
            <i className="fas fa-file-csv mr-1"></i> CSV
          </button>
          <button onClick={() => exportData('json')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
            <i className="fas fa-file-code mr-1"></i> JSON
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100">
            <i className="fas fa-print mr-1"></i> Print
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Source</label>
            <select value={dataSource} onChange={e=>setDataSource(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="products">Products</option>
              <option value="ledger">Ledger</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chart Type</label>
            <select value={chartType} onChange={e=>setChartType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Aggregation</label>
            <select value={aggregation} onChange={e=>setAggregation(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
            <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Options</label>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={showTotals} onChange={e=>setShowTotals(e.target.checked)} className="rounded" />
              <span className="text-sm">Show Totals</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 capitalize">{chartType} Chart - {dataSource} Data</h3>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{sortedData.length} records</span>
        </div>
        {sortedData.length > 0 ? renderChart() : (
          <div className="h-[350px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <i className="fas fa-chart-bar text-4xl mb-3"></i>
              <p>No data available. Add data to see visualizations.</p>
            </div>
          </div>
        )}
        {showTotals && sortedData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Grand Total:</span>
            <span className="font-bold text-gray-800">{total.toLocaleString()}</span>
          </div>
        )}
      </motion.div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Data Table View</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {sortedData.length > 0 && Object.keys(sortedData[0]).map(key => (
                  <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 table-row">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-gray-700">{typeof val === 'number' ? val.toLocaleString() : val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
