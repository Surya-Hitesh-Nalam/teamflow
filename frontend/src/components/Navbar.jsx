import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-800">
            TeamFlow
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link to="/projects" className="text-gray-600 hover:text-gray-900 font-medium">
              Projects
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && <NotificationCenter />}
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
          {user?.role === 'ADMIN' && (
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-tight">
              Admin
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 ml-4 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
