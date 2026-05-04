import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import PriorityBadge from '../components/PriorityBadge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/projects/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Dashboard fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Failed to load dashboard</p>
      </div>
    );
  }

  const { summary, myTasks, recentActivity } = data;

  const ongoingTasks = myTasks.filter(t => t.status !== 'DONE');
  const completedTasks = myTasks.filter(t => t.status === 'DONE');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workspace Dashboard</h1>
          <Link to="/projects" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
            View All Projects
          </Link>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <SummaryCard label="Total Projects" value={summary.totalProjects} color="bg-indigo-50 text-indigo-700 border-indigo-100" />
          <SummaryCard label="Ongoing Tasks" value={ongoingTasks.length} color="bg-amber-50 text-amber-700 border-amber-100" />
          <SummaryCard label="Completed" value={summary.completedTasks} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
          <SummaryCard label="Overdue" value={summary.overdueTasks} color="bg-rose-50 text-rose-700 border-rose-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* my tasks section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Ongoing Tasks */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Ongoing Tasks
                <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">{ongoingTasks.length}</span>
              </h2>
              <div className="space-y-3">
                {ongoingTasks.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
                    <p className="text-gray-400 text-sm">No active tasks assigned to you.</p>
                  </div>
                ) : (
                  ongoingTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  Recently Completed
                  <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                </h2>
                <div className="space-y-3 opacity-80">
                  {completedTasks.slice(0, 5).map(task => <TaskCard key={task.id} task={task} isDone />)}
                </div>
              </div>
            )}
          </div>

          {/* recent activity section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Activity Feed
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-1">
                  {recentActivity.length === 0 ? (
                    <p className="p-6 text-center text-gray-400 text-sm italic">No recent activity</p>
                  ) : (
                    recentActivity.map((log, idx) => (
                      <div 
                        key={log.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors ${idx !== recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {log.user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-700 leading-snug">
                              <span className="font-bold text-gray-900">{log.user?.name}</span>{' '}
                              {log.action}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{log.timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-6 border shadow-sm transition-transform hover:scale-[1.02] cursor-default ${color}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function TaskCard({ task, isDone }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group ${
        task.isOverdue && !isDone ? 'border-l-4 border-l-rose-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded">
               {task.project?.name}
             </span>
          </div>
          <p className={`text-base font-bold transition-colors group-hover:text-indigo-600 ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <PriorityBadge priority={task.priority} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right">
          {task.isOverdue && !isDone && (
            <span className="text-[10px] bg-rose-100 text-rose-600 font-black px-2 py-1 rounded-full uppercase tracking-tighter">
              Overdue
            </span>
          )}
          {task.dueDate && (
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
