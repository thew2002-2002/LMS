'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin_dashboard' },
    { name: 'Manage Users', path: '/admin_users' },
    { name: 'Courses', path: '/admin_courses' },
    { name: 'Reports', path: '/admin_reports' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Pastel Deep Teal */}
      <aside className="w-64 bg-teal-900 text-teal-50 flex flex-col shadow-2xl z-10">
        <div className="p-6 text-2xl font-extrabold tracking-wider text-teal-100 border-b border-teal-800/50 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-teal-400 text-teal-900 flex items-center justify-center text-sm shadow-md">L</span>
          LMS Admin
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                pathname === item.path 
                ? 'bg-teal-700/80 text-white shadow-md shadow-teal-900/50 translate-x-1' 
                : 'text-teal-100/70 hover:bg-teal-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-teal-200/50 text-center">
          &copy; 2024 LMS System
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Pastel Blobs for unique look */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-200/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10"></div>

        {/* Header - Soft Glassmorphism */}
        <header className="bg-white/70 backdrop-blur-md p-4 shadow-sm border-b border-white/50 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-700 ml-2">Admin Portal</h2>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 bg-rose-100 text-rose-600 font-medium rounded-xl hover:bg-rose-200 transition-colors shadow-sm"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}