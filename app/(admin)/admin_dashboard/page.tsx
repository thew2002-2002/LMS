'use client';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Students', value: '1,245', trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: '🎓' },
    { title: 'Total Teachers', value: '45', trend: '+3%', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', icon: '👨‍🏫' },
    { title: 'Active Courses', value: '28', trend: '+2', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: '📚' },
    { title: 'Total Revenue', value: 'Rs. 4.2M', trend: '+8%', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: '💰' },
  ];

  const recentActivities = [
    { id: 1, text: 'New student registered: John Doe', time: '2 mins ago', type: 'student' },
    { id: 2, text: 'Course "Web Dev" updated by Teacher.', time: '1 hour ago', type: 'course' },
    { id: 3, text: 'Payment received from Jane Smith.', time: '3 hours ago', type: 'payment' },
    { id: 4, text: 'New assignment uploaded to "Math 101".', time: '5 hours ago', type: 'assignment' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, here is what's happening today.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-600/20 transition-all hover:shadow-md">
          + Add New Student
        </button>
      </div>

      {/* 2. Stats Cards (Pastel & Modern) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
          >
            {/* Decorative Blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 ${stat.bg}`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1">{stat.title}</p>
                <h3 className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.bg} ${stat.border} border shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm relative z-10">
              <span className="text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-md">{stat.trend}</span>
              <span className="text-slate-400 ml-2 font-medium">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Chart Section (Pure CSS) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Revenue Analytics</h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-32 p-2 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          
          {/* CSS Bar Chart */}
          <div className="flex items-end justify-between h-64 mt-4 gap-2">
            {[40, 70, 45, 90, 65, 85, 55, 100, 75, 60, 80, 50].map((height, i) => (
              <div key={i} className="flex flex-col items-center w-full group">
                <div className="relative w-full flex justify-center h-full items-end">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Rs. {height}k
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[2.5rem] bg-teal-100 group-hover:bg-teal-400 rounded-t-md transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                    {/* Inner Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-500/20 to-transparent"></div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 mt-2 font-medium">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {recentActivities.map((activity, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {activity.type === 'student' && '👤'}
                  {activity.type === 'course' && '📖'}
                  {activity.type === 'payment' && '💳'}
                  {activity.type === 'assignment' && '📝'}
                </div>
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-700 text-sm">{activity.text}</div>
                  </div>
                  <div className="text-slate-400 text-xs">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}