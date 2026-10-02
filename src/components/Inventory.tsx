import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, Product, generateId } from '../store';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState<Partial<Product>>({
    sku: '', name: '', category: '', image: '', description: '',
    stockLevel: 0, reorderPoint: 10, location: '', unitCost: 0,
    sellingPrice: 0, supplier: '', supplierContact: '', status: 'available'
  });

  useEffect(() => { setProducts(store.getProducts()); }, []);

  const saveProduct = () => {
    const now = new Date().toISOString();
    const status = form.stockLevel! <= 0 ? 'out_of_stock' : form.stockLevel! <= form.reorderPoint! ? 'low' : 'available';
    if (editingId) {
      const updated = products.map(p => p.id === editingId ? { ...p, ...form, status, lastUpdated: now } as Product : p);
      setProducts(updated);
      store.setProducts(updated);
    } else {
      const newProduct: Product = { ...form, id: generateId(), status, dateAdded: now, lastUpdated: now } as Product;
      const updated = [...products, newProduct];
      setProducts(updated);
      store.setProducts(updated);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ sku: '', name: '', category: '', image: '', description: '', stockLevel: 0, reorderPoint: 10, location: '', unitCost: 0, sellingPrice: 0, supplier: '', supplierContact: '', status: 'available' });
    setShowForm(false);
    setEditingId(null);
  };

  const editProduct = (p: Product) => {
    setForm(p);
    setEditingId(p.id);
    setShowForm(true);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    store.setProducts(updated);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-500 text-sm">Track and manage all your products</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">In Stock</p>
          <p className="text-2xl font-bold text-green-600">{products.filter(p=>p.status==='available').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{products.filter(p=>p.status==='low').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{products.filter(p=>p.status==='out_of_stock').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg" />
        </div>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <i className="fas fa-box-open text-4xl mb-3 block"></i>
                  <p>No products found. Add your first product!</p>
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 table-row">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <i className="fas fa-box text-indigo-500 text-sm"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.stockLevel}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">₹{p.sellingPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status==='available'?'bg-green-100 text-green-700':p.status==='low'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                      {p.status === 'available' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={()=>editProduct(p)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100"><i className="fas fa-edit text-xs"></i></button>
                      <button onClick={()=>deleteProduct(p.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU / Item ID</label><input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="PROD-001" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Product name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Electronics, Clothing..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Warehouse A" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Stock Level</label><input type="number" value={form.stockLevel} onChange={e=>setForm({...form,stockLevel:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label><input type="number" value={form.reorderPoint} onChange={e=>setForm({...form,reorderPoint:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹)</label><input type="number" value={form.unitCost} onChange={e=>setForm({...form,unitCost:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label><input type="number" value={form.sellingPrice} onChange={e=>setForm({...form,sellingPrice:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label><input value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Supplier name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label><input value={form.supplierContact} onChange={e=>setForm({...form,supplierContact:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Phone / Email" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={3} placeholder="Product description..." /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveProduct} className="btn-primary flex-1">{editingId ? 'Update Product' : 'Add Product'}</button>
                <button onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
