import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, DataEntryForm, DataEntryField, generateId } from '../store';

export default function DataEntry() {
  const [forms, setForms] = useState<DataEntryForm[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [activeForm, setActiveForm] = useState<DataEntryForm | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTheme, setFormTheme] = useState('indigo');
  const [fields, setFields] = useState<DataEntryField[]>([]);
  const [responses, setResponses] = useState<Record<string, any>[]>([]);
  const [currentResponse, setCurrentResponse] = useState<Record<string, any>>({});

  useEffect(() => { setForms(store.getDataForms()); }, []);

  const addField = (type: DataEntryField['type']) => {
    setFields([...fields, { id: generateId(), type, label: '', required: false, options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined, placeholder: '' }]);
  };

  const updateField = (id: string, updates: Partial<DataEntryField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const saveForm = () => {
    const newForm: DataEntryForm = { id: generateId(), title: formTitle, theme: formTheme, fields, responses: [], createdAt: new Date().toISOString() };
    const updated = [...forms, newForm];
    setForms(updated); store.setDataForms(updated);
    resetBuilder();
  };

  const resetBuilder = () => {
    setFormTitle(''); setFormTheme('indigo'); setFields([]); setShowBuilder(false);
  };

  const submitResponse = () => {
    if (!activeForm) return;
    const updated = forms.map(f => f.id === activeForm.id ? { ...f, responses: [...f.responses, currentResponse] } : f);
    setForms(updated); store.setDataForms(updated);
    setCurrentResponse({});
    setShowResponse(false);
  };

  const deleteForm = (id: string) => {
    const updated = forms.filter(f => f.id !== id);
    setForms(updated); store.setDataForms(updated);
  };

  const exportForm = (form: DataEntryForm, format: string) => {
    let content = '';
    if (format === 'csv') {
      const headers = form.fields.map(f => f.label).join(',');
      const rows = form.responses.map(r => form.fields.map(f => r[f.id] || '').join(','));
      content = [headers, ...rows].join('\n');
    } else {
      content = JSON.stringify(form, null, 2);
    }
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.title}.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  const themes: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
    cyan: 'from-cyan-500 to-blue-500',
    slate: 'from-slate-700 to-slate-900',
  };

  const fieldTypes = [
    { type: 'text' as const, icon: 'fa-font', label: 'Text' },
    { type: 'number' as const, icon: 'fa-hashtag', label: 'Number' },
    { type: 'email' as const, icon: 'fa-envelope', label: 'Email' },
    { type: 'date' as const, icon: 'fa-calendar', label: 'Date' },
    { type: 'select' as const, icon: 'fa-chevron-down', label: 'Dropdown' },
    { type: 'checkbox' as const, icon: 'fa-check-square', label: 'Checkbox' },
    { type: 'radio' as const, icon: 'fa-dot-circle', label: 'Radio' },
    { type: 'textarea' as const, icon: 'fa-align-left', label: 'Paragraph' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Entry Management</h2>
          <p className="text-gray-500 text-sm">Create custom forms with multiple field types</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center gap-2">
          <i className="fas fa-plus"></i> Create Form
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <i className="fas fa-clipboard-list text-4xl mb-3 block"></i>
            <p>No forms created yet. Build your first custom form!</p>
          </div>
        ) : forms.map(f => (
          <motion.div key={f.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-hover">
            <div className={`h-2 bg-gradient-to-r ${themes[f.theme] || themes.indigo}`}></div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-800">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.fields.length} fields • {f.responses.length} responses</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setActiveForm(f); setShowResponse(true); }} className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                  <i className="fas fa-pen mr-1"></i> Fill
                </button>
                <button onClick={() => exportForm(f, 'csv')} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">
                  <i className="fas fa-download mr-1"></i> Export
                </button>
                <button onClick={() => deleteForm(f.id)} className="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetBuilder}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Form Builder</h3>
                <button onClick={resetBuilder} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label><input value={formTitle} onChange={e=>setFormTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="My Custom Form" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <div className="flex gap-2">
                    {Object.entries(themes).map(([k, v]) => (
                      <button key={k} onClick={() => setFormTheme(k)} className={`w-8 h-8 rounded-full bg-gradient-to-r ${v} ${formTheme === k ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}></button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field Type Buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Add Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldTypes.map(ft => (
                    <button key={ft.type} onClick={() => addField(ft.type)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2">
                      <i className={`fas ${ft.icon}`}></i> {ft.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields List */}
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={f.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded capitalize">{f.type}</span>
                      <div className="flex-1"></div>
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={f.required} onChange={e=>updateField(f.id,{required:e.target.checked})} /> Required</label>
                      <button onClick={()=>removeField(f.id)} className="text-red-400 hover:text-red-600"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                    <input value={f.label} onChange={e=>updateField(f.id,{label:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" placeholder="Field label..." />
                    {(f.type === 'select' || f.type === 'radio') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Options (comma separated):</p>
                        <input value={f.options?.join(', ') || ''} onChange={e=>updateField(f.id,{options:e.target.value.split(',').map(s=>s.trim())})} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Option 1, Option 2, Option 3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-plus-circle text-3xl mb-2"></i>
                  <p className="text-sm">Click field types above to add them to your form</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={saveForm} disabled={!formTitle || fields.length===0} className="btn-primary flex-1 disabled:opacity-50">Save Form</button>
                <button onClick={resetBuilder} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fill Form Modal */}
      <AnimatePresence>
        {showResponse && activeForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowResponse(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className={`h-2 bg-gradient-to-r ${themes[activeForm.theme] || themes.indigo} rounded-t-xl -mt-6 -mx-6 mb-6`}></div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">{activeForm.title}</h3>
              <div className="space-y-4">
                {activeForm.fields.map(f => (
                  <div key={f.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    {f.type === 'text' && <input onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder={f.placeholder} />}
                    {f.type === 'number' && <input type="number" onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />}
                    {f.type === 'email' && <input type="email" onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />}
                    {f.type === 'date' && <input type="date" onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />}
                    {f.type === 'textarea' && <textarea onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={3} />}
                    {f.type === 'select' && <select onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option value="">Select...</option>{f.options?.map(o=><option key={o} value={o}>{o}</option>)}</select>}
                    {f.type === 'radio' && <div className="space-y-1">{f.options?.map(o=><label key={o} className="flex items-center gap-2"><input type="radio" name={f.id} value={o} onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.value})} /> <span className="text-sm">{o}</span></label>)}</div>}
                    {f.type === 'checkbox' && <label className="flex items-center gap-2"><input type="checkbox" onChange={e=>setCurrentResponse({...currentResponse,[f.id]:e.target.checked})} /> <span className="text-sm">Yes</span></label>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={submitResponse} className="btn-primary flex-1">Submit Response</button>
                <button onClick={()=>setShowResponse(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
