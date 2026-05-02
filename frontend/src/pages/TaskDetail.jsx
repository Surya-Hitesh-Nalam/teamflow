import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PriorityBadge from '../components/PriorityBadge';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTaskAndComments();
  }, [id]);

  const fetchTaskAndComments = async () => {
    try {
      setLoading(true);
      const [taskRes, commentsRes] = await Promise.all([
        API.get(`/tasks/${id}`),
        API.get(`/tasks/${id}/comments`)
      ]);
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments);
    } catch (err) {
      setError('Failed to load task details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await API.patch(`/tasks/${id}`, { status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    try {
      setUpdating(true);
      await API.patch(`/tasks/${id}`, { priority: newPriority });
      setTask({ ...task, priority: newPriority });
    } catch (err) {
      alert('Failed to update priority');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`/tasks/${id}/comments`, { content: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${id}`);
      navigate(`/projects/${task.projectId}`);
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading task details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/projects" className="hover:text-blue-600">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${task.projectId}`} className="hover:text-blue-600">{task.project?.name}</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">Task Details</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
              <PriorityBadge priority={task.priority} />
              {task.isOverdue && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">OVERDUE</span>
              )}
            </div>
            {user.role === 'ADMIN' && (
              <button 
                onClick={handleDeleteTask}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete Task
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">{task.description || 'No description provided.'}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50/50">
          <div className="p-8 border-r border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Assignee</span>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    {task.assignee?.name.charAt(0) || '?'}
                  </div>
                  {task.assignee?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created By</span>
                <span className="text-gray-900">{task.creator?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Date</span>
                <span className={`font-medium ${task.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Update Status</label>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  value={task.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updating}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Update Priority</label>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  value={task.priority}
                  onChange={(e) => handleUpdatePriority(e.target.value)}
                  disabled={updating}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            💬 Comments
            <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
          </h2>

          <form onSubmit={handleAddComment} className="mb-8">
            <textarea 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 mb-3"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-black transition shadow-sm"
              >
                Post Comment
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
                    {comment.user.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <p className="font-bold text-sm text-gray-900 mb-1">{comment.user.name}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-2 font-medium uppercase tracking-wider">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-12 text-gray-400 italic">
                No comments yet. Be the first to chime in!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
