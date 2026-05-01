import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  const fetchProjects = () => {
    API.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(err => console.error('Failed to fetch projects:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/projects', { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-slate-800 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6 mb-6">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                rows={2}
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-slate-800 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <span>{project.members?.length || 0} members</span>
                  <span>{project._count?.tasks || 0} tasks</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Owner: {project.owner?.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
