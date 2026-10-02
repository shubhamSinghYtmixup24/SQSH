import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { store, Employee, generateId, generateEmpId, User } from '../store';

interface Props { user: User; }

export default function Employees({ user }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({
    fullName: '', dob: '', contact: '', email: '', address: '',
    emergencyContact: '', jobTitle: '', department: '', dateOfJoining: '',
    workLocation: '', salary: 0, attendance: [], performance: [], documents: []
  });

  useEffect(() => { setEmployees(store.getEmployees()); }, []);

  const saveEmployee = () => {
    if (editingId) {
      const updated = employees.map(e => e.id === editingId ? { ...e, ...form } as Employee : e);
      setEmployees(updated); store.setEmployees(updated);
    } else {
      const newEmp: Employee = { ...form, id: generateId(), empId: generateEmpId(user.company), attendance: [], performance: [], documents: [] } as Employee;
      const updated = [...employees, newEmp];
      setEmployees(updated); store.setEmployees(updated);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ fullName: '', dob: '', contact: '', email: '', address: '', emergencyContact: '', jobTitle: '', department: '', dateOfJoining: '', workLocation: '', salary: 0 });
    setShowForm(false); setEditingId(null);
  };

  const markAttendance = (empId: string, status: 'present' | 'absent' | 'leave' | 'half-day') => {
    const today = new Date().toISOString().split('T')[0];
    const updated = employees.map(e => {
      if (e.id === empId) {
        const existing = e.attendance.findIndex(a => a.date === today);
        const newAttendance = [...e.attendance];
        if (existing >= 0) newAttendance[existing] = { date: today, status };
        else newAttendance.push({ date: today, status });
        return { ...e, attendance: newAttendance };
      }
      return e;
    });
    setEmployees(updated); store.setEmployees(updated);
  };

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated); store.setEmployees(updated);
  };

  const filtered = employees.filter(e => e.fullName.toLowerCase().includes(search.toLowerCase()) || e.empId.toLowerCase().includes(search.toLowerCase()));

  const todayPresent = employees.filter(e => e.attendance.some(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present')).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-500 text-sm">Manage employees, attendance & performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAttendance(true)} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 flex items-center gap-2">
            <i className="fas fa-clipboard-check"></i> Attendance
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <i className="fas fa-user-plus"></i> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Present Today</p>
          <p className="text-2xl font-bold text-green-600">{todayPresent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Departments</p>
          <p className="text-2xl font-bold text-indigo-600">{new Set(employees.map(e=>e.department)).size}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Avg. Salary</p>
          <p className="text-2xl font-bold text-amber-600">₹{employees.length ? Math.round(employees.reduce((s,e)=>s+e.salary,0)/employees.length).toLocaleString() : 0}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or employee ID..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg" />
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <i className="fas fa-users text-4xl mb-3 block"></i>
            <p>No employees found. Add your first employee!</p>
          </div>
        ) : filtered.map(emp => (
          <motion.div key={emp.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm card-hover">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {emp.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{emp.fullName}</p>
                  <p className="text-xs text-gray-500">{emp.empId}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={()=>setViewEmployee(emp)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><i className="fas fa-eye text-xs"></i></button>
                <button onClick={()=>{setForm(emp);setEditingId(emp.id);setShowForm(true)}} className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                <button onClick={()=>deleteEmployee(emp.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><i className="fas fa-briefcase w-5 text-gray-400"></i> {emp.jobTitle}</p>
              <p><i className="fas fa-building w-5 text-gray-400"></i> {emp.department}</p>
              <p><i className="fas fa-phone w-5 text-gray-400"></i> {emp.contact}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>markAttendance(emp.id,'present')} className="flex-1 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100">Present</button>
              <button onClick={()=>markAttendance(emp.id,'absent')} className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Absent</button>
              <button onClick={()=>markAttendance(emp.id,'leave')} className="flex-1 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100">Leave</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attendance Panel Modal */}
      <AnimatePresence>
        {showAttendance && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowAttendance(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Master Attendance Panel</h3>
                <button onClick={()=>setShowAttendance(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Date: {new Date().toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
              <div className="space-y-2">
                {employees.map(emp => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayRecord = emp.attendance.find(a => a.date === today);
                  return (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">{emp.fullName.charAt(0)}</div>
                        <div><p className="text-sm font-medium">{emp.fullName}</p><p className="text-xs text-gray-500">{emp.empId}</p></div>
                      </div>
                      <div className="flex gap-2">
                        {(['present','absent','leave','half-day'] as const).map(s => (
                          <button key={s} onClick={()=>markAttendance(emp.id,s)} className={`px-3 py-1 rounded-lg text-xs font-medium ${todayRecord?.status===s ? (s==='present'?'bg-green-500 text-white':s==='absent'?'bg-red-500 text-white':s==='leave'?'bg-amber-500 text-white':'bg-blue-500 text-white') : 'bg-gray-200 text-gray-600'}`}>
                            {s.charAt(0).toUpperCase()+s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Employee Modal */}
      <AnimatePresence>
        {viewEmployee && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setViewEmployee(null)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Employee Certificate</h3>
                <div className="flex gap-2">
                  <button onClick={()=>window.print()} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm"><i className="fas fa-print mr-1"></i>Print</button>
                  <button onClick={()=>setViewEmployee(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
                </div>
              </div>
              <div className="border-2 border-indigo-200 rounded-xl p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-600">{user.company}</h2>
                  <p className="text-sm text-gray-500">Employee Certificate</p>
                  <div className="w-20 h-0.5 bg-indigo-500 mx-auto mt-2"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Employee ID:</span> <span className="font-medium">{viewEmployee.empId}</span></div>
                  <div><span className="text-gray-500">Full Name:</span> <span className="font-medium">{viewEmployee.fullName}</span></div>
                  <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{viewEmployee.dob}</span></div>
                  <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{viewEmployee.contact}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{viewEmployee.email}</span></div>
                  <div><span className="text-gray-500">Department:</span> <span className="font-medium">{viewEmployee.department}</span></div>
                  <div><span className="text-gray-500">Job Title:</span> <span className="font-medium">{viewEmployee.jobTitle}</span></div>
                  <div><span className="text-gray-500">Date of Joining:</span> <span className="font-medium">{viewEmployee.dateOfJoining}</span></div>
                  <div><span className="text-gray-500">Work Location:</span> <span className="font-medium">{viewEmployee.workLocation}</span></div>
                  <div><span className="text-gray-500">Salary:</span> <span className="font-medium">₹{viewEmployee.salary?.toLocaleString()}</span></div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">System Auth: ADMINPRO-{viewEmployee.empId}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-12 border-b-2 border-indigo-300 mb-1"></div>
                    <p className="text-xs text-gray-500">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Employee Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label><input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label><input value={form.emergencyContact} onChange={e=>setForm({...form,emergencyContact:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label><input value={form.jobTitle} onChange={e=>setForm({...form,jobTitle:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label><input type="date" value={form.dateOfJoining} onChange={e=>setForm({...form,dateOfJoining:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label><input value={form.workLocation} onChange={e=>setForm({...form,workLocation:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label><input type="number" value={form.salary} onChange={e=>setForm({...form,salary:+e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveEmployee} className="btn-primary flex-1">{editingId ? 'Update' : 'Add Employee'}</button>
                <button onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
