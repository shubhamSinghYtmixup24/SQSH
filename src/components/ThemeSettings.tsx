import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { store, ThemeConfig } from '../store';

export default function ThemeSettings() {
  const [theme, setTheme] = useState<ThemeConfig>(store.getTheme());
  const [activeTab, setActiveTab] = useState('colors');

  const saveTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    store.setTheme(newTheme);
  };

  const colorPresets = [
    { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
    { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#06b6d4' },
    { name: 'Rose', primary: '#f43f5e', secondary: '#ec4899', accent: '#f59e0b' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444' },
    { name: 'Cyan', primary: '#06b6d4', secondary: '#0891b2', accent: '#8b5cf6' },
    { name: 'Slate', primary: '#475569', secondary: '#334155', accent: '#6366f1' },
    { name: 'Purple', primary: '#9333ea', secondary: '#7c3aed', accent: '#ec4899' },
    { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#6366f1' },
  ];

  const components = [
    { name: 'Accordion', icon: 'fa-bars', desc: 'Collapsible content panels' },
    { name: 'Alert Box', icon: 'fa-exclamation-triangle', desc: 'Notification messages' },
    { name: 'Avatar', icon: 'fa-user-circle', desc: 'User profile images' },
    { name: 'Badge', icon: 'fa-certificate', desc: 'Status indicators' },
    { name: 'Banner', icon: 'fa-flag', desc: 'Promotional headers' },
    { name: 'Bottom Navigation', icon: 'fa-ellipsis-h', desc: 'Mobile nav bar' },
    { name: 'Breadcrumb', icon: 'fa-angle-right', desc: 'Navigation trail' },
    { name: 'Button', icon: 'fa-square', desc: 'Action triggers' },
    { name: 'Card', icon: 'fa-id-card', desc: 'Content containers' },
    { name: 'Carousel', icon: 'fa-images', desc: 'Image sliders' },
    { name: 'Checkbox', icon: 'fa-check-square', desc: 'Multi-select inputs' },
    { name: 'Chip / Pill', icon: 'fa-tag', desc: 'Compact elements' },
    { name: 'Color Picker', icon: 'fa-palette', desc: 'Color selection' },
    { name: 'Data Table', icon: 'fa-table', desc: 'Tabular data display' },
    { name: 'Date Picker', icon: 'fa-calendar', desc: 'Date selection' },
    { name: 'Divider', icon: 'fa-minus', desc: 'Content separators' },
    { name: 'Dropdown Menu', icon: 'fa-caret-down', desc: 'Selection menus' },
    { name: 'Empty State', icon: 'fa-inbox', desc: 'No content placeholder' },
    { name: 'FAB', icon: 'fa-plus-circle', desc: 'Floating action button' },
    { name: 'Hamburger Menu', icon: 'fa-bars', desc: 'Navigation toggle' },
    { name: 'Hero Section', icon: 'fa-star', desc: 'Page header' },
    { name: 'Icon Button', icon: 'fa-mouse-pointer', desc: 'Icon-only actions' },
    { name: 'Image Cropper', icon: 'fa-crop', desc: 'Image editing' },
    { name: 'Infinite Scroll', icon: 'fa-arrows-alt-v', desc: 'Lazy loading' },
    { name: 'Kebab Menu', icon: 'fa-ellipsis-v', desc: 'Vertical options' },
    { name: 'Loader / Spinner', icon: 'fa-spinner', desc: 'Loading indicators' },
    { name: 'Masonry Grid', icon: 'fa-th', desc: 'Pinterest layout' },
    { name: 'Meatball Menu', icon: 'fa-ellipsis-h', desc: 'Horizontal options' },
    { name: 'Mega Menu', icon: 'fa-th-large', desc: 'Expanded navigation' },
    { name: 'Modal / Dialog', icon: 'fa-window-maximize', desc: 'Popup windows' },
    { name: 'Notification / Toast', icon: 'fa-bell', desc: 'Alert popups' },
    { name: 'Pagination', icon: 'fa-file-alt', desc: 'Page navigation' },
    { name: 'Password Input', icon: 'fa-key', desc: 'Secure text input' },
    { name: 'Popover', icon: 'fa-comment', desc: 'Contextual info' },
    { name: 'Progress Bar', icon: 'fa-tasks', desc: 'Progress indicators' },
    { name: 'Radio Button', icon: 'fa-dot-circle', desc: 'Single selection' },
    { name: 'Rating Stars', icon: 'fa-star', desc: 'Star ratings' },
    { name: 'Ribbon', icon: 'fa-ribbon', desc: 'Decorative labels' },
    { name: 'Search Bar', icon: 'fa-search', desc: 'Search input' },
    { name: 'Sidebar / Drawer', icon: 'fa-columns', desc: 'Side navigation' },
    { name: 'Skeleton Loader', icon: 'fa-hourglass-half', desc: 'Content placeholders' },
    { name: 'Slider (Range)', icon: 'fa-sliders-h', desc: 'Range selection' },
    { name: 'Snackbar', icon: 'fa-comment-dots', desc: 'Brief messages' },
    { name: 'Stepper / Wizard', icon: 'fa-list-ol', desc: 'Multi-step forms' },
    { name: 'Switch / Toggle', icon: 'fa-toggle-on', desc: 'On/off toggle' },
    { name: 'Tabs', icon: 'fa-folder', desc: 'Tab navigation' },
    { name: 'Text Field', icon: 'fa-i-cursor', desc: 'Text input' },
    { name: 'Time Picker', icon: 'fa-clock', desc: 'Time selection' },
    { name: 'Tooltip', icon: 'fa-info-circle', desc: 'Hover information' },
    { name: 'Tree View', icon: 'fa-sitemap', desc: 'Hierarchical display' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Theme Customization</h2>
        <p className="text-gray-500 text-sm">Customize the look and feel of your admin panel</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['colors', 'layout', 'effects', 'components'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'colors' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
          {/* Color Presets */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Color Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {colorPresets.map(preset => (
                <button key={preset.name} onClick={() => saveTheme({ primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent })}
                  className={`p-4 rounded-xl border-2 transition ${theme.primaryColor === preset.primary ? 'border-indigo-500 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex gap-1 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{background: preset.primary}}></div>
                    <div className="w-6 h-6 rounded-full" style={{background: preset.secondary}}></div>
                    <div className="w-6 h-6 rounded-full" style={{background: preset.accent}}></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Custom Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={theme.primaryColor} onChange={e=>saveTheme({primaryColor:e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input type="text" value={theme.primaryColor} onChange={e=>saveTheme({primaryColor:e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={theme.secondaryColor} onChange={e=>saveTheme({secondaryColor:e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input type="text" value={theme.secondaryColor} onChange={e=>saveTheme({secondaryColor:e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={theme.accentColor} onChange={e=>saveTheme({accentColor:e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input type="text" value={theme.accentColor} onChange={e=>saveTheme({accentColor:e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Preview</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{background: theme.primaryColor}}>Primary Button</button>
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{background: theme.secondaryColor}}>Secondary Button</button>
              <button className="px-4 py-2 rounded-lg text-white font-medium" style={{background: theme.accentColor}}>Accent Button</button>
              <span className="px-3 py-1 rounded-full text-white text-sm" style={{background: theme.primaryColor}}>Badge</span>
              <div className="w-32 h-8 rounded-lg" style={{background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`}}></div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'layout' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Sidebar Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['gradient', 'solid', 'glass'] as const).map(style => (
                <button key={style} onClick={() => saveTheme({sidebarStyle: style})}
                  className={`p-4 rounded-xl border-2 transition ${theme.sidebarStyle === style ? 'border-indigo-500' : 'border-gray-100'}`}>
                  <div className={`h-20 rounded-lg mb-2 ${style === 'gradient' ? 'bg-gradient-to-b from-indigo-900 to-purple-900' : style === 'solid' ? 'bg-gray-800' : 'bg-white/50 backdrop-blur border border-white/30'}`}></div>
                  <p className="text-sm font-medium capitalize">{style}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Border Radius</h3>
            <div className="grid grid-cols-5 gap-3">
              {(['none', 'sm', 'md', 'lg', 'xl'] as const).map(r => (
                <button key={r} onClick={() => saveTheme({borderRadius: r})}
                  className={`p-4 rounded-xl border-2 transition ${theme.borderRadius === r ? 'border-indigo-500' : 'border-gray-100'}`}>
                  <div className={`w-12 h-12 mx-auto bg-indigo-100 ${r==='none'?'rounded-none':r==='sm'?'rounded':r==='md'?'rounded-md':r==='lg'?'rounded-lg':'rounded-xl'}`}></div>
                  <p className="text-xs font-medium mt-2 capitalize text-center">{r}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'effects' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Animation & Sound</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Enable Animations</p>
                  <p className="text-sm text-gray-500">Smooth transitions and motion effects</p>
                </div>
                <button onClick={() => saveTheme({animationEnabled: !theme.animationEnabled})}
                  className={`w-12 h-6 rounded-full transition ${theme.animationEnabled ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${theme.animationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Sound Effects</p>
                  <p className="text-sm text-gray-500">Soft audio feedback on interactions</p>
                </div>
                <button onClick={() => saveTheme({soundEnabled: !theme.soundEnabled})}
                  className={`w-12 h-6 rounded-full transition ${theme.soundEnabled ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${theme.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-700">Volume Level</p>
                  <span className="text-sm text-gray-500">{theme.volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={theme.volume} onChange={e=>saveTheme({volume:+e.target.value})} className="w-full accent-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Magic Effects Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 bg-indigo-50 rounded-xl text-center ${theme.animationEnabled ? 'magic-glow' : ''}`}>
                <i className="fas fa-wand-magic-sparkles text-2xl text-indigo-500 mb-2"></i>
                <p className="text-xs text-gray-600">Glow Effect</p>
              </div>
              <div className={`p-4 bg-purple-50 rounded-xl text-center ${theme.animationEnabled ? 'animate-pulse-soft' : ''}`}>
                <i className="fas fa-sparkles text-2xl text-purple-500 mb-2"></i>
                <p className="text-xs text-gray-600">Pulse Effect</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-xl text-center card-hover">
                <i className="fas fa-arrows-alt text-2xl text-cyan-500 mb-2"></i>
                <p className="text-xs text-gray-600">Hover Lift</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <i className="fas fa-circle-notch text-2xl text-emerald-500 mb-2 animate-spin"></i>
                <p className="text-xs text-gray-600">Spinner</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'components' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">UI Components Library ({components.length} components)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {components.map((comp, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${comp.icon} text-indigo-500`}></i>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{comp.name}</p>
                      <p className="text-xs text-gray-500">{comp.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
