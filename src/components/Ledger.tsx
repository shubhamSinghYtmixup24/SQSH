import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, LedgerEntry, generateId, User, formatCurrency } from '../store';

interface Props { user: User; }

export default function Ledger({ user }: Props) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [entryType, setEntryType] = useState('billing');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<LedgerEntry>>({
    accountId: '', accountName: '', accountType: 'asset', openingBalance: 0, currentBalance: 0,
    currency: 'INR', transactionDate: new Date().toISOString().split('T')[0],
    voucherNumber: '', description: '', debit: 0, credit: 0,
    partyName: '', costCenter: '', invoiceNumber: '', paymentMethod: 'cash',
    reconciliationStatus: 'pending'
  });

  useEffect(() => { setEntries(store.getLedger()); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey) {
        if (e.key === 'B' || e.key === 'b') { e.preventDefault(); setEntryType('billing'); setShowForm(true); }
        if (e.key === 'P' || e.key === 'p') { e.preventDefault(); setEntryType('payment'); setShowForm(true); }
        if (e.key === 'J' || e.key === 'j') { e.preventDefault(); setEntryType('journal'); setShowForm(true); }
        if (e.key === 'S' || e.key === 's') { e.preventDefault(); setEntryType('sale'); setShowForm(true); }
        if (e.key === 'U' || e.key === 'u') { e.preventDefault(); setEntryType('purchase'); setShowForm(true); }
        if (e.key === 'C' || e.key === 'c') { e.preventDefault(); setEntryType('credit-note'); setShowForm(true); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveEntry = () => {
    const newEntry: LedgerEntry = {
      ...form,
      id: generateId(),
      transactionId: 'TXN-' + generateId().toUpperCase(),
      runningBalance: (form.openingBalance || 0) + (form.credit || 0) - (form.debit || 0),
      createdBy: user.id,
      entryTime: new Date().toISOString(),
      reconciledDate: '',
      documents: [],
    } as LedgerEntry;
    const updated = [...entries, newEntry];
    setEntries(updated);
    store.setLedger(updated);
    resetForm();
  };

  const resetForm = () => {
    setForm({ accountId: '', accountName: '', accountType: 'asset', openingBalance: 0, currentBalance: 0, currency: 'INR', transactionDate: new Date().toISOString().split('T')[0], voucherNumber: '', description: '', debit: 0, credit: 0, partyName: '', costCenter: '', invoiceNumber: '', paymentMethod: 'cash', reconciliationStatus: 'pending' });
    setShowForm(false);
  };

  const toggleReconcile = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, reconciliationStatus: e.reconciliationStatus === 'pending' ? 'reconciled' as const : 'pending' as const, reconciledDate: e.reconciliationStatus === 'pending' ? new Date().toISOString() : '' } : e);
    setEntries(updated); store.setLedger(updated);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated); store.setLedger(updated);
  };

  const filtered = entries.filter(e => {
    const matchSearch = e.accountName.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()) || e.voucherNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || e.accountType === filter;
    return matchSearch && matchFilter;
  });

  const totalDebit = filtered.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = filtered.reduce((s, e) => s + (e.credit || 0), 0);

  const entryTypes = [
    { key: 'billing', label: 'Billing', icon: 'fa-file-invoice', shortcut: 'Alt+Shift+B', color: 'bg-blue-50 text-blue-600' },
    { key: 'payment', label: 'Payment', icon: 'fa-credit-card', shortcut: 'Alt+Shift+P', color: 'bg-green-50 text-green-600' },
    { key: 'journal', label: 'Journal', icon: 'fa-book', shortcut: 'Alt+Shift+J', color: 'bg-purple-50 text-purple-600' },
    { key: 'sale', label: 'Sale', icon: 'fa-arrow-trend-up', shortcut: 'Alt+Shift+S', color: 'bg-emerald-50 text-emerald-600' },
    { key: 'purchase', label: 'Purchase', icon: 'fa-cart-shopping', shortcut: 'Alt+Shift+U', color: 'bg-amber-50 text-amber-600' },
    { key: 'credit-note', label: 'Credit Note', icon: 'fa-receipt', shortcut: 'Alt+Shift+C', color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ledger Management</h2>
          <p className="text-gray-500 text-sm">Financial records, billing & reconciliation</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <i className="fas fa-plus"></i> New Entry
        </button>
      </div>

      {/* Quick Entry Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {entryTypes.map(t => (
          <button key={t.key} onClick={() => { setEntryType(t.key); setShowForm(true); }}
            className={`${t.color} rounded-xl p-3 text-center card-hover border border-transparent hover:border-current/20`}>
            <i className={`fas ${t.icon} text-lg mb-1`}></i>
            <p className="text-sm font-medium">{t.label}</p>
            <p className="text-xs opacity-60">{t.shortcut}</p>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Debit</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebit)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Credit</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalCredit)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Net Balance</p>
          <p className={`text-xl font-bold ${totalCredit-totalDebit>=0?'text-green-600':'text-red-600'}`}>{formatCurrency(totalCredit - totalDebit)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg" />
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg">
          <option value="">All Types</option>
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="equity">Equity</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Debit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <i className="fas fa-book text-4xl mb-3 block"></i>
                  <p>No entries found. Create your first ledger entry!</p>
                </td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-gray-50 table-row">
                  <td className="px-4 py-3 text-sm text-gray-600">{e.transactionDate}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{e.accountName}</p>
                    <p className="text-xs text-gray-500">{e.voucherNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.description}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{e.debit ? formatCurrency(e.debit) : '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{e.credit ? formatCurrency(e.credit) : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>toggleReconcile(e.id)} className={`px-2 py-1 rounded-full text-xs font-medium ${e.reconciliationStatus==='reconciled'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                      {e.reconciliationStatus === 'reconciled' ? '✓ Reconciled' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={()=>deleteEntry(e.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><i className="fas fa-trash text-xs"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">New {entryTypes.find(t=>t.key===entryType)?.label} Entry</h3>
                  <p className="text-sm text-gray-500">Entry Type: <span className="font-medium capitalize">{entryType}</span></p>
                </div>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label><input value={form.accountName} onChange={e=>setForm({...form,accountName:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Account name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select value={form.accountType} onChange={e=>setForm({...form,accountType:e.target.value as any})} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option value="asset">Asset</option><option value="liability">Liability</option><option value="equity">Equity</option><option value="revenue">Revenue</option><option value="expense">Expense</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Voucher / Reference No.</label><input value={form.voucherNumber} onChange={e=>setForm({...form,voucherNumber:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="VCH-001" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label><input type="date" value={form.transactionDate} onChange={e=>setForm({...form,transactionDate:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Debit Amount (₹)</label><input type="number" value={form.debit} onChange={e=>setForm({...form,debit:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Credit Amount (₹)</label><input type="number" value={form.credit} onChange={e=>setForm({...form,credit:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label><input value={form.partyName} onChange={e=>setForm({...form,partyName:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Customer / Vendor" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="upi">UPI</option><option value="cheque">Cheque</option><option value="card">Card</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice / Bill Number</label><input value={form.invoiceNumber} onChange={e=>setForm({...form,invoiceNumber:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label><input value={form.costCenter} onChange={e=>setForm({...form,costCenter:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description / Narration</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={2} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveEntry} className="btn-primary flex-1">Save Entry</button>
                <button onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
