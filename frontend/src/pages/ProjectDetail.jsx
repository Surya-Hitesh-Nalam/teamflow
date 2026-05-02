import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PriorityBadge from '../components/PriorityBadge';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task creation state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    dueDate: ''
  });

  // Member management state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, activityRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/tasks`),
        API.get(`/projects/${id}/activity`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
      setActivities(activityRes.data.activities);
    } catch (err) {
      setError('Failed to load project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/projects/${id}/tasks`, newTask);
      setTasks([...tasks, res.data.task]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' });
      fetchProjectData(); // Refresh activity log
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      fetchProjectData(); // Refresh activity log
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setMemberEmail('');
      alert('Member added successfully');
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const columns = [
    { title: 'To Do', status: 'TODO' },
    { title: 'In Progress', status: 'IN_PROGRESS' },
    { title: 'Done', status: 'DONE' }
  ];

  if (loading) return <div className="p-8 text-center">Loading project...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/projects" className="hover:text-blue-600">Projects</Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(col => (
              <div key={col.status} className="bg-gray-50 rounded-xl p-4 min-h-[500px] border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    {col.title}
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.status === col.status).length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {tasks.filter(t => t.status === col.status).map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <PriorityBadge priority={task.priority} />
                        <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                          {col.status !== 'TODO' && (
                            <button onClick={() => handleUpdateTaskStatus(task.id, 'TODO')} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Move to Todo">←</button>
                          )}
                          {col.status !== 'DONE' && (
                            <button onClick={() => handleUpdateTaskStatus(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Move Forward">→</button>
                          )}
                        </div>
                      </div>
                      <Link to={`/tasks/${task.id}`} className="block">
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                             👤 {task.assignee?.name || 'Unassigned'}
                          </span>
                          {task.isOverdue && (
                            <span className="text-red-500 font-medium">⚠️ Overdue</span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === col.status).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Members section */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              👥 Members
            </h3>
            <div className="space-y-3 mb-6">
              {project.members?.map(m => (
                <div key={m.userId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {m.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.user.name}</p>
                      <p className="text-gray-500 text-xs">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {user.role === 'ADMIN' && (
              <form onSubmit={handleAddMember} className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Member</p>
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  required
                />
                <select 
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value)}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-black transition">
                  Invite
                </button>
              </form>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              📜 Recent Activity
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {activities.map(log => (
                <div key={log.id} className="text-sm border-l-2 border-blue-100 pl-3 py-1">
                  <p className="text-gray-900">
                    <span className="font-semibold">{log.user.name}</span> {log.action}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{log.timeAgo}</p>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4 italic">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  placeholder="Details..."
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
