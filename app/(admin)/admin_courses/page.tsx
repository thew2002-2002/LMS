'use client';

import { useState, useEffect } from 'react';

export default function AdminCourses() {
  const [modules, setModules] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ module_name: '', module_code: '' });
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // දත්ත ගන්න function එක
  const fetchData = async () => {
    const modRes = await fetch('/api/modules');
    const modData = await modRes.json();
    setModules(modData);

    // Teacher ලාව විතරක් ගන්නවා
    const teachRes = await fetch('/api/users?role=teacher');
    const teachData = await teachRes.json();
    setTeachers(teachData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // අලුත් Course එකක් හදන්න
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ module_name: '', module_code: '' });
      fetchData();
    } else {
      const error = await res.json();
      alert(error.message);
    }
    setLoading(false);
  };

  // Teacher ව පවරන function එක
  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: selectedModule.id, teacher_id: selectedTeacher || null }),
    });

    if (res.ok) {
      setIsAssignModalOpen(false);
      setSelectedModule(null);
      setSelectedTeacher('');
      fetchData(); // ලිස්ට් එක අලුත් කරන්න
    } else {
      alert('Failed to assign teacher.');
    }
    setLoading(false);
  };

  // Assign Modal එක අරින function එක
  const openAssignModal = (module: any) => {
    setSelectedModule(module);
    setSelectedTeacher(module.teacher_id || '');
    setIsAssignModalOpen(true);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Courses</h1>
          <p className="text-slate-500 mt-1">Create modules and assign teachers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all"
        >
          + Add New Course
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">{module.module_name}</h3>
            <p className="text-sm font-medium text-teal-600 bg-teal-50 inline-block px-2 py-1 rounded-md mb-4">{module.module_code}</p>
            
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="text-sm">
                <span className="text-slate-400">Teacher: </span>
                <span className={module.teacher_name ? "font-semibold text-slate-700" : "text-rose-500 italic"}>
                  {module.teacher_name || 'Not Assigned'}
                </span>
              </div>
              <button 
                onClick={() => openAssignModal(module)}
                className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-1 bg-slate-50 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                ⚙️ Assign
              </button>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
            <div className="text-4xl mb-3">📚</div>
            No courses added yet. Click "+ Add New Course" to start.
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Add New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCreateModule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input required type="text" placeholder="e.g. Web Development" value={formData.module_name} onChange={e => setFormData({...formData, module_name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                <input required type="text" placeholder="e.g. WEB-101" value={formData.module_code} onChange={e => setFormData({...formData, module_code: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-black" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {isAssignModalOpen && selectedModule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assign Teacher</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedModule.module_name} ({selectedModule.module_code})</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-rose-500 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleAssignTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Teacher</label>
                <select 
                  value={selectedTeacher} 
                  onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
                >
                  <option value="">-- Unassign Teacher --</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.full_name} ({teacher.email})</option>
                  ))}
                </select>
                {teachers.length === 0 && (
                  <p className="text-rose-500 text-xs mt-2">No teachers found. Add a teacher in "Manage Users" first.</p>
                )}
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-white bg-slate-800 hover:bg-slate-900 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50">
                  {loading ? 'Assigning...' : 'Assign Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}