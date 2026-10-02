import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, User, generateId } from '../store';

interface Props { user: User; }

export default function AdminSettings({ user }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', mobile: '', countryCode: '+91', company: '', role: 'user' as 'admin' | 'user' });
  const [changePassword, setChangePassword] = useState({ current: '', newPass: '', confirm: '' });
  const [reportFields, setReportFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => { setUsers(store.getUsers()); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createUser = () => {
    const created: User = {
      id: generateId(), ...newUser, createdAt: new Date().toISOString()
    };
    const updated = [...users, created];
    setUsers(updated); store.setUsers(updated);
    setShowCreateUser(false);
    setNewUser({ name: '', email: '', password: '', mobile: '', countryCode: '+91', company: '', role: 'user' });
  };

  const deleteUser = (id: string) => {
    if (id === user.id) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated); store.setUsers(updated);
  };

  const handleChangePassword = () => {
    if (changePassword.newPass !== changePassword.confirm) return;
    const updated = users.map(u => u.id === user.id ? { ...u, password: changePassword.newPass } : u);
    setUsers(updated); store.setUsers(updated);
    store.setCurrentUser({ ...user, password: changePassword.newPass });
    setChangePassword({ current: '', newPass: '', confirm: '' });
  };

  const exportAllData = () => {
    const data = {
      users: store.getUsers(),
      products: store.getProducts(),
      employees: store.getEmployees(),
      ledger: store.getLedger(),
      dataForms: store.getDataForms(),
      exportDate: new Date().toISOString(),
      exportedBy: user.name,
    };
    let content = '';
    let filename = '';
    if (exportFormat === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'adminpro-export.json';
    } else if (exportFormat === 'csv') {
      const allProducts = store.getProducts();
      if (allProducts.length > 0) {
        const headers = Object.keys(allProducts[0]).join(',');
        const rows = allProducts.map(p => Object.values(p).join(','));
        content = [headers, ...rows].join('\n');
      }
      filename = 'adminpro-export.csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `adminpro-export.${exportFormat}`;
    }
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const sendHelpEmail = () => {
    const subject = 'AdminPro Support Request';
    const body = `Hello AdminPro Support,\n\nI need help with:\n\n[Please describe your issue]\n\nUser: ${user.name}\nCompany: ${user.company}\nEmail: ${user.email}\n\nThank you.`;
    window.open(`mailto:shubham8800757836@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const tabs = [
    { key: 'users', label: 'User Management', icon: 'fa-users' },
    { key: 'password', label: 'Password', icon: 'fa-key' },
    { key: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    { key: 'export', label: 'Export Data', icon: 'fa-download' },
    { key: 'help', label: 'Help & Support', icon: 'fa-life-ring' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin & Settings</h2>
        <p className="text-gray-500 text-sm">Manage users, security, reports and system settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition ${activeTab === tab.key ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">All Users ({users.length})</h3>
            <button onClick={() => setShowCreateUser(true)} className="btn-primary flex items-center gap-2 text-sm">
              <i className="fas fa-user-plus"></i> Create User
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{u.name.charAt(0)}</div>
                        <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.countryCode}{u.mobile}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.company}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>setEditingUser(u)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><i className="fas fa-eye text-xs"></i></button>
                        {u.id !== user.id && <button onClick={()=>deleteUser(u.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-md">
          <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={changePassword.current} onChange={e=>setChangePassword({...changePassword,current:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={changePassword.newPass} onChange={e=>setChangePassword({...changePassword,newPass:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><input type="password" value={changePassword.confirm} onChange={e=>setChangePassword({...changePassword,confirm:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <button onClick={handleChangePassword} className="btn-primary w-full">Update Password</button>
          </div>
        </motion.div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Generate Custom Report</h3>
          <p className="text-sm text-gray-500 mb-4">Select fields to include in your report:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {['Product Name', 'SKU', 'Category', 'Stock Level', 'Selling Price', 'Unit Cost', 'Supplier', 'Status', 'Date Added', 'Employee Name', 'Department', 'Salary', 'Account Name', 'Debit', 'Credit', 'Transaction Date'].map(field => (
              <label key={field} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={reportFields.includes(field)} onChange={e => {
                  if (e.target.checked) setReportFields([...reportFields, field]);
                  else setReportFields(reportFields.filter(f => f !== field));
                }} className="rounded accent-indigo-500" />
                <span className="text-sm text-gray-700">{field}</span>
              </label>
            ))}
          </div>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <i className="fas fa-file-pdf"></i> Generate & Print Report
          </button>
        </motion.div>
      )}

      {/* Export */}
      {activeTab === 'export' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Export All Data</h3>
          <p className="text-sm text-gray-500 mb-4">Choose format and export all your business data:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['json', 'csv', 'txt', 'xml'].map(fmt => (
              <button key={fmt} onClick={() => setExportFormat(fmt)}
                className={`p-4 rounded-xl border-2 text-center transition ${exportFormat === fmt ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}>
                <i className={`fas ${fmt==='json'?'fa-file-code':fmt==='csv'?'fa-file-csv':fmt==='xml'?'fa-file-code':'fa-file-alt'} text-2xl mb-2 ${exportFormat===fmt?'text-indigo-500':'text-gray-400'}`}></i>
                <p className="text-sm font-medium uppercase">{fmt}</p>
              </button>
            ))}
          </div>
          <button onClick={exportAllData} className="btn-primary flex items-center gap-2">
            <i className="fas fa-download"></i> Export as .{exportFormat}
          </button>
        </motion.div>
      )}

      {/* Help */}
      {activeTab === 'help' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Help & Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center"><i className="fas fa-envelope text-white"></i></div>
                  <div><p className="font-medium text-gray-800">Email Support</p><p className="text-sm text-gray-500">shubham8800757836@gmail.com</p></div>
                </div>
                <button onClick={sendHelpEmail} className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">Send Email</button>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center"><i className="fas fa-phone text-white"></i></div>
                  <div><p className="font-medium text-gray-800">Call Support</p><p className="text-sm text-gray-500">+91 8800757836</p></div>
                </div>
                <a href="tel:+918800757836" className="block w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium text-center hover:bg-green-600">Call Now</a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { keys: 'Alt + Shift + B', action: 'New Billing Entry' },
                { keys: 'Alt + Shift + P', action: 'Print / New Payment' },
                { keys: 'Alt + Shift + J', action: 'New Journal Entry' },
                { keys: 'Alt + Shift + S', action: 'New Sale Entry' },
                { keys: 'Alt + Shift + U', action: 'New Purchase Entry' },
                { keys: 'Alt + Shift + C', action: 'New Credit Note' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{s.action}</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">About AdminPro</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Developer:</strong> Shubham</p>
              <p><strong>Contact:</strong> shubham8800757836@gmail.com | +918800757836</p>
              <p><strong>Features:</strong> Inventory, Employee Management, Ledger, Data Entry, Analytics, Theme Customization</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateUser && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowCreateUser(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Create New User</h3>
                <button onClick={()=>setShowCreateUser(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Company</label><input value={newUser.company} onChange={e=>setNewUser({...newUser,company:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value as 'admin'|'user'})} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={createUser} className="btn-primary w-full">Create User</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setEditingUser(null)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button onClick={()=>setEditingUser(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">{editingUser.name.charAt(0)}</div>
                <h4 className="font-bold text-gray-800">{editingUser.name}</h4>
                <p className="text-sm text-gray-500">{editingUser.role.toUpperCase()}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Email</span><span className="font-medium">{editingUser.email}</span></div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Phone</span><span className="font-medium">{editingUser.countryCode}{editingUser.mobile}</span></div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Company</span><span className="font-medium">{editingUser.company}</span></div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Joined</span><span className="font-medium">{new Date(editingUser.createdAt).toLocaleDateString()}</span></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
