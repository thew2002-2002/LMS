'use client';

import { useState, useEffect } from 'react';

type SubjectSummary = {
  id: number;
  name: string;
  subject_code?: string;
  teacher?: string | null;
};

type UserRow = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  student_id?: string | null;
  grade?: string | null;
  subjects?: SubjectSummary[];
  enrolled_subjects?: SubjectSummary[];
};

type SubjectRow = {
  id: number;
  subject_name: string;
  subject_code: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student'); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', role: 'student', student_id: '', grade: '', subject_id: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data: unknown = await res.json();

      if (!res.ok) {
        const message = typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: unknown }).message)
          : 'Failed to load users';
        console.error('GET /api/users failed:', message, data);
        setUsers([]);
        return;
      }

      setUsers(Array.isArray(data) ? data as UserRow[] : []);
    } catch (error) {
      console.error('Network error while loading users:', error);
      setUsers([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects', { cache: 'no-store' });
      const data: unknown = await res.json();

      if (!res.ok) {
        console.error('GET /api/subjects failed:', data);
        setSubjects([]);
        return;
      }

      setSubjects(Array.isArray(data) ? data as SubjectRow[] : []);
    } catch (error) {
      console.error('Network error while loading subjects:', error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchUsers(), fetchSubjects()]);
    };

    void loadInitialData();
  }, []);

  const resetForm = () => {
    setFormData({ full_name: '', email: '', password: '', role: activeTab, student_id: '', grade: '', subject_id: '' });
    setIsEditing(false);
    setEditUserId(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      await res.json();

      setIsModalOpen(false);
      resetForm();
      
      await fetchUsers();
      await fetchSubjects(); 
    } else {
      const error = await res.json();
      alert(error.message);
    }
    setLoading(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, id: editUserId }),
    });

    if (res.ok) {
      setIsModalOpen(false);
      resetForm();
      
      await fetchUsers();
      await fetchSubjects();
    } else {
      const error = await res.json();
      alert(error.message);
    }
    setLoading(false);
  };

  const openDeleteModal = (user: UserRow) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setLoading(true);
    const res = await fetch(`/api/users?id=${userToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      await fetchUsers();
      await fetchSubjects(); 
    } else {
      alert("Failed to delete user.");
    }
    setLoading(false);
  };

  const openEditModal = (user: UserRow) => {
    let currentSubjectId = '';
    if (user.role === 'teacher' && Array.isArray(user.subjects) && user.subjects.length > 0) {
      currentSubjectId = user.subjects[0].id.toString(); 
    }

    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '', 
      role: user.role,
      student_id: user.student_id || '',
      grade: user.grade || '',
      subject_id: currentSubjectId 
    });
    setEditUserId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => user.role === activeTab) : [];

  const tabs = [
    { id: 'student', label: 'Students', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'teacher', label: 'Teachers', color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'cashier', label: 'Cashiers', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'admin', label: 'Admins', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 mt-1">View students and teachers with their respective subjects.</p>
        </div>
        <button onClick={openAddModal} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all">
          + Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id ? `${tab.bg} ${tab.color} shadow-sm` : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/50' : 'bg-slate-100'}`}>
              {Array.isArray(users) ? users.filter(u => u.role === tab.id).length : 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              {activeTab === 'student' && (
                <>
                  <th className="p-4 font-semibold">Student ID</th>
                  <th className="p-4 font-semibold">Grade</th>
                  <th className="p-4 font-semibold">Enrolled Subject & Teacher</th>
                </>
              )}
              {activeTab === 'teacher' && (
                <>
                  <th className="p-4 font-semibold">Assigned Subjects</th>
                </>
              )}
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{user.full_name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                
                {activeTab === 'student' && (
                  <>
                    <td className="p-4 text-slate-600">{user.student_id || '-'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">{user.grade || 'N/A'}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {Array.isArray(user.enrolled_subjects) && user.enrolled_subjects.length > 0
                        ? user.enrolled_subjects.map((sub, i) => (
                          <div key={`${sub.id}-${i}`} className="mb-1">
                            <strong className="text-slate-800">{sub.name}</strong>{' '}
                            <span className="text-teal-600 text-xs">(by {sub.teacher || 'N/A'})</span>
                          </div>
                        ))
                        : <span className="text-rose-400 italic text-xs">Not enrolled</span>}
                    </td>
                  </>
                )}

                {activeTab === 'teacher' && (
                  <td className="p-4 text-sm text-slate-600">
                    {Array.isArray(user.subjects) && user.subjects.length > 0
                      ? user.subjects.map((sub, i) => (
                        <span key={`${sub.id}-${i}`} className="inline-block bg-teal-50 text-teal-700 px-2 py-1 rounded-md mr-2 mb-1 text-xs">{sub.name}</span>
                      ))
                      : <span className="text-rose-400 italic text-xs">No subjects assigned</span>}
                  </td>
                )}

                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(user)} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => openDeleteModal(user)} className="text-sm font-medium text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <div className="text-4xl mb-3">📭</div>
                  No {activeTab}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? 'Edit User' : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isEditing ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <input required={!isEditing} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black" />
              </div>
              
              <input type="hidden" value={formData.role} />

              {activeTab === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Subject (Optional)</label>
                  <select value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black bg-white">
                    <option value="">-- No Subject Assigned --</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subject_name} ({sub.subject_code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'student' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                      <input type="text" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} placeholder="e.g. STU-001" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                      <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black bg-white">
                        <option value="">Select Grade</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="Grade 13">Grade 13</option>
                      </select>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Enroll to Subject (Optional)</label>
                      <select value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-black bg-white">
                        <option value="">-- Don&apos;t enroll yet --</option>
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.subject_name} ({sub.subject_code})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-white bg-slate-800 hover:bg-slate-900 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Save User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Delete User?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete <strong className="text-slate-700">{userToDelete.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
              <button onClick={confirmDeleteUser} disabled={loading} className="flex-1 px-4 py-2.5 text-white bg-rose-600 hover:bg-rose-700 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50">
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}