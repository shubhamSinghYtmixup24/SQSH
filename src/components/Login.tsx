import React, { useState } from 'react';
import { store, generateId, User } from '../store';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    mobile: '', countryCode: '+91', company: '', role: 'user' as 'admin' | 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = store.getUsers();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      store.setCurrentUser(user);
      onLogin(user);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const users = store.getUsers();
    if (users.find(u => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }
    const newUser: User = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      countryCode: formData.countryCode,
      password: formData.password,
      role: formData.role,
      company: formData.company,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    store.setUsers(users);
    setSuccess('Account created successfully! Please login.');
    setIsRegister(false);
    setFormData({ ...formData, password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft" style={{animationDelay: '2s'}}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-effect rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <i className="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">AdminPro</h1>
            <p className="text-gray-500 text-sm mt-1">Complete Business Management Panel</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isRegister ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >Login</button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isRegister ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >Register</button>
          </div>

          {error && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>{error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-check-circle mr-2"></i>{success}
            </motion.div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="Enter your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <i className="fas fa-building absolute left-3 top-3 text-gray-400"></i>
                    <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="Your company name" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                    <select value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value})}
                      className="w-full py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+971">+971</option>
                      <option value="+86">+86</option>
                      <option value="+81">+81</option>
                      <option value="+49">+49</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <i className="fas fa-phone absolute left-3 top-3 text-gray-400"></i>
                      <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="Mobile number" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin'|'user'})}
                    className="w-full py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="••••••••" />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                  <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition" placeholder="••••••••" />
                </div>
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-3 text-base mt-2">
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Support: shubham8800757836@gmail.com | +918800757836</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
