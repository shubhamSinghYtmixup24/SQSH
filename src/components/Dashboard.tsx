import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { store, User, Product, Employee, LedgerEntry, formatCurrency } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DashboardProps { user: User; }

export default function Dashboard({ user }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    setProducts(store.getProducts());
    setEmployees(store.getEmployees());
    setLedger(store.getLedger());
  }, []);

  const totalRevenue = ledger.filter(l => l.accountType === 'revenue').reduce((s, l) => s + l.credit, 0);
  const totalExpense = ledger.filter(l => l.accountType === 'expense').reduce((s, l) => s + l.debit, 0);
  const totalStock = products.reduce((s, p) => s + p.stockLevel, 0);
  const lowStockItems = products.filter(p => p.stockLevel <= p.reorderPoint);

  // Top 5 selling products (simulated from ledger)
  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name.substring(0, 15),
    sales: Math.floor(Math.random() * 100) + 20,
  }));

  const monthlyData = [
    { month: 'Jan', revenue: 45000, expense: 32000 },
    { month: 'Feb', revenue: 52000, expense: 28000 },
    { month: 'Mar', revenue: 48000, expense: 35000 },
    { month: 'Apr', revenue: 61000, expense: 30000 },
    { month: 'May', revenue: 55000, expense: 33000 },
    { month: 'Jun', revenue: 67000, expense: 38000 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#6366f1' },
    { name: 'Clothing', value: 25, color: '#8b5cf6' },
    { name: 'Food', value: 20, color: '#06b6d4' },
    { name: 'Others', value: 20, color: '#10b981' },
  ];

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue || 228000), icon: 'fa-rupee-sign', color: 'from-indigo-500 to-purple-500', change: '+12.5%' },
    { label: 'Total Products', value: products.length || 156, icon: 'fa-boxes-stacked', color: 'from-cyan-500 to-blue-500', change: '+8.2%' },
    { label: 'Employees', value: employees.length || 24, icon: 'fa-users', color: 'from-emerald-500 to-teal-500', change: '+3.1%' },
    { label: 'Low Stock Alerts', value: lowStockItems.length || 7, icon: 'fa-triangle-exclamation', color: 'from-amber-500 to-orange-500', change: '-2.4%' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="gradient-bg rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-white/80 mt-1">{user.company} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <i className="fas fa-chart-line text-8xl"></i>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}}
            className="bg-white rounded-xl p-5 shadow-sm card-hover border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  <i className={`fas fa-arrow-${stat.change.startsWith('+') ? 'up' : 'down'} mr-1`}></i>{stat.change} this month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <i className={`fas ${stat.icon} text-white text-lg`}></i>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Revenue & Expenses</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#e2e8f0" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{background: c.color}}></div>
                <span className="text-gray-600">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.5}}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top 5 Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-yellow-500':i===1?'bg-gray-400':i===2?'bg-amber-600':'bg-gray-300'}`}>{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{p.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: `${p.sales}%`}}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">{p.sales} units</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.6}}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: 'fa-box', text: 'New product added: Wireless Earbuds', time: '2 min ago', color: 'text-indigo-500 bg-indigo-50' },
              { icon: 'fa-user-plus', text: 'New employee: Priya Sharma joined', time: '1 hour ago', color: 'text-green-500 bg-green-50' },
              { icon: 'fa-file-invoice', text: 'Invoice #1234 generated', time: '3 hours ago', color: 'text-amber-500 bg-amber-50' },
              { icon: 'fa-chart-line', text: 'Monthly report exported', time: '5 hours ago', color: 'text-cyan-500 bg-cyan-50' },
              { icon: 'fa-triangle-exclamation', text: 'Low stock alert: USB Cables', time: '1 day ago', color: 'text-red-500 bg-red-50' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}>
                  <i className={`fas ${a.icon} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
