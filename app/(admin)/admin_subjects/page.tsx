'use client';

import { useState, useEffect } from 'react';

type TeacherSummary = { id: number; name: string };

type SubjectRow = {
  id: number;
  subject_name: string;
  subject_code: string;
  teachers?: TeacherSummary[];
};

type ClassRow = {
  id: number;
  grade: string;
  teacher_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
  zoom_link?: string | null;
};

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subject_name: '', subject_code: '' });
  
  const [selectedSubject, setSelectedSubject] = useState<SubjectRow | null>(null);
  const [classFormData, setClassFormData] = useState({ teacher_id: '', grade: '', class_date: '', start_time: '', end_time: '', zoom_link: '' });

  const fetchData = async () => {
    try {
      const subRes = await fetch('/api/subjects', { cache: 'no-store' });
      const subData: unknown = await subRes.json();

      if (!subRes.ok) {
        console.error('GET /api/subjects failed:', subData);
        setSubjects([]);
        return;
      }

      setSubjects(Array.isArray(subData) ? subData as SubjectRow[] : []);
    } catch (error) {
      console.error('Network error while loading subjects:', error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchData();
    };

    void loadInitialData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result: unknown = await res.json();

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ subject_name: '', subject_code: '' });
      await fetchData();
    } else {
      const message = typeof result === 'object' && result !== null && 'message' in result
        ? String((result as { message: unknown }).message)
        : 'Failed to create subject';
      console.error('POST /api/subjects failed:', res.status, result);
      alert(message);
    }
    setLoading(false);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedSubject) {
      setLoading(false);
      return;
    }

    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...classFormData, subject_id: selectedSubject.id }),
    });

    if (res.ok) {
      setIsClassModalOpen(false);
      setClassFormData({ teacher_id: '', grade: '', class_date: '', start_time: '', end_time: '', zoom_link: '' });
      fetchClasses(selectedSubject.id);
    } else {
      alert('Failed to create class');
    }
    setLoading(false);
  };

  const fetchClasses = async (subjectId: number) => {
    const res = await fetch(`/api/classes?subject_id=${subjectId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setClasses(data as ClassRow[]);
    } else {
      setClasses([]);
    }
  };

  const openClassModal = (subject: SubjectRow) => {
    setSelectedSubject(subject);
    setIsClassModalOpen(true);
  };

  const openDetailsModal = async (subject: SubjectRow) => {
    setSelectedSubject(subject);
    await fetchClasses(subject.id);
    setIsDetailsModalOpen(true);
  };

  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Subjects</h1>
          <p className="text-slate-500 mt-1">Create subjects and schedule classes. Teachers are assigned automatically from User Management.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all">
          + Add New Subject
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeSubjects.map((subject) => (
          <div key={subject.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div onClick={() => openDetailsModal(subject)} className="cursor-pointer">
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">{subject.subject_name}</h3>
                <p className="text-sm font-medium text-teal-600 bg-teal-50 inline-block px-2 py-1 rounded-md mb-4">{subject.subject_code}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Teachers</span>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">{Array.isArray(subject.teachers) ? subject.teachers.length : 0}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                    {Array.isArray(subject.teachers) && subject.teachers.length > 0 ? subject.teachers.map((t) => (
                        <span key={t.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{t.name}</span>
                    )) : <span className="text-xs text-rose-400 italic">No teachers assigned</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openClassModal(subject)} className="w-full text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 py-2 rounded-lg transition-colors shadow-sm">+ Add Class Schedule</button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add New Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Subject</h2>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                <input required type="text" value={formData.subject_name} onChange={e => setFormData({...formData, subject_name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Code</label>
                <input required type="text" value={formData.subject_code} onChange={e => setFormData({...formData, subject_code: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 text-white bg-teal-600 rounded-xl font-medium">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Class (Schedule) Modal */}
      {isClassModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Schedule New Class</h2>
            <p className="text-sm text-slate-500 mb-4">{selectedSubject.subject_name}</p>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Teacher</label>
                <select required value={classFormData.teacher_id} onChange={e => setClassFormData({...classFormData, teacher_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black">
                  <option value="">-- Choose Teacher --</option>
                  {Array.isArray(selectedSubject.teachers) && selectedSubject.teachers.length > 0 ? selectedSubject.teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  )) : <option disabled>No teachers assigned to this subject yet.</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                <input required type="text" placeholder="e.g. Grade 10" value={classFormData.grade} onChange={e => setClassFormData({...classFormData, grade: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" value={classFormData.class_date} onChange={e => setClassFormData({...classFormData, class_date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zoom Link</label>
                  <input type="url" placeholder="https://zoom.us/..." value={classFormData.zoom_link} onChange={e => setClassFormData({...classFormData, zoom_link: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input required type="time" value={classFormData.start_time} onChange={e => setClassFormData({...classFormData, start_time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input required type="time" value={classFormData.end_time} onChange={e => setClassFormData({...classFormData, end_time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-black" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 text-white bg-teal-600 rounded-xl font-medium">{loading ? 'Saving...' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Details Modal */}
      {isDetailsModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-800 text-white relative">
              <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-6 right-6 text-3xl font-bold text-slate-300 hover:text-white">&times;</button>
              <h2 className="text-2xl font-bold mb-1">{selectedSubject.subject_name}</h2>
              <p className="text-teal-400 font-medium">{selectedSubject.subject_code}</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Teachers Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Assigned Teachers</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(selectedSubject.teachers) && selectedSubject.teachers.length > 0 ? selectedSubject.teachers.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg">{t.name.charAt(0)}</div>
                      <span className="font-medium text-slate-700">{t.name}</span>
                    </div>
                  )) : <p className="text-slate-400">No teachers assigned yet.</p>}
                </div>
              </div>

              {/* Classes Schedule Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Class Schedule</h3>
                {classes.length > 0 ? (
                  <div className="space-y-3">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow bg-white">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">{cls.grade}</span>
                            <span className="font-semibold text-slate-800">{cls.teacher_name}</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {new Date(cls.class_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-3">
                          <div className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
                            {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                          </div>
                          {cls.zoom_link && (
                            <a href={cls.zoom_link} target="_blank" rel="noreferrer" className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm">Join Zoom</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400">No classes scheduled yet.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}