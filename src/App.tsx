import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, User } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Employees from './components/Employees';
import DataEntry from './components/DataEntry';
import Ledger from './components/Ledger';
import DataViewer from './components/DataViewer';
import ThemeSettings from './components/ThemeSettings';
import AdminSettings from './components/AdminSettings';

type Page = 'dashboard' | 'inventory' | 'employees' | 'dataentry' | 'ledger' | 'dataviewer' | 'theme' | 'settings';

function App() {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    store.setCurrentUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    store.setCurrentUser(null);
    setActivePage('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { key: 'dashboard' as Page, label: 'Dashboard', icon: 'fa-chart-line' },
    { key: 'inventory' as Page, label: 'Inventory', icon: 'fa-boxes-stacked' },
    { key: 'employees' as Page, label: 'Employees', icon: 'fa-users' },
    { key: 'dataentry' as Page, label: 'Data Entry', icon: 'fa-clipboard-list' },
    { key: 'ledger' as Page, label: 'Ledger', icon: 'fa-book' },
    { key: 'dataviewer' as Page, label: 'Data Viewer', icon: 'fa-chart-pie' },
    { key: 'theme' as Page, label: 'Theme', icon: 'fa-palette' },
    { key: 'settings' as Page, label: 'Admin & Settings', icon: 'fa-cog' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'inventory': return <Inventory />;
      case 'employees': return <Employees user={user} />;
      case 'dataentry': return <DataEntry />;
      case 'ledger': return <Ledger user={user} />;
      case 'dataviewer': return <DataViewer />;
      case 'theme': return <ThemeSettings />;
      case 'settings': return <AdminSettings user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 h-full transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-full gradient-sidebar flex flex-col">
          {/* Logo */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <i className="fas fa-shield-alt text-white text-lg"></i>
            </div>
            {sidebarOpen && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="overflow-hidden">
                <h1 className="text-white font-bold text-lg leading-tight">AdminPro</h1>
                <p className="text-white/50 text-xs">{user.company}</p>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
            {menuItems.map(item => (
              <button key={item.key} onClick={() => { setActivePage(item.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activePage === item.key ? 'bg-white/15 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                {activePage === item.key && sidebarOpen && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400"></div>}
              </button>
            ))}
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-3 border-t border-white/10 hidden md:block">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition">
              <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
              {sidebarOpen && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <i className="fas fa-bars text-gray-600"></i>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 capitalize">{menuItems.find(m=>m.key===activePage)?.label}</h2>
              <p className="text-xs text-gray-500 hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <i className="fas fa-search text-gray-400 text-sm mr-2"></i>
              <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-40" />
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <i className="fas fa-bell text-gray-600 text-sm"></i>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">3</span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <i className="fas fa-chevron-down text-gray-400 text-xs hidden sm:block"></i>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:5}}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={() => { setActivePage('settings'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <i className="fas fa-cog text-gray-400"></i> Settings
                    </button>
                    <button onClick={() => { setActivePage('theme'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <i className="fas fa-palette text-gray-400"></i> Theme
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration: 0.2}}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
