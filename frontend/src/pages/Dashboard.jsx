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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        {/* summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Projects" value={summary.totalProjects} color="bg-blue-50 text-blue-700" />
          <SummaryCard label="My Tasks" value={summary.totalTasks} color="bg-slate-50 text-slate-700" />
          <SummaryCard label="Completed" value={summary.completedTasks} color="bg-green-50 text-green-700" />
          <SummaryCard label="Overdue" value={summary.overdueTasks} color="bg-red-50 text-red-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* my tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-800 mb-3">My Tasks</h2>
            <div className="space-y-2">
              {myTasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No tasks assigned to you</p>
              ) : (
                myTasks.map(task => (
                  <Link
                    to={`/tasks/${task.id}`}
                    key={task.id}
                    className={`block bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-4 hover:shadow-md transition-shadow ${
                      task.isOverdue ? 'border-l-4 border-red-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.project?.name} · {task.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        {task.isOverdue && (
                          <span className="text-xs text-red-500 font-medium">Overdue</span>
                        )}
                      </div>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* recent activity */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map(log => (
                    <div key={log.id} className="text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">{log.user?.name}</span>{' '}
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-400">{log.timeAgo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
