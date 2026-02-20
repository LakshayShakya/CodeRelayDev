import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Folder, GitPullRequest } from 'lucide-react';
import { projectService, Project } from '../services/project.service';
import { notificationService } from '../services/notification.service';
import NotificationDropdown from '../components/NotificationDropdown';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'reviewer';
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // If user is a reviewer, redirect to reviewer dashboard
    if (userData.role === 'reviewer') {
      navigate('/reviewer');
      return;
    }
    
    fetchProjects();
    fetchUnreadCount();
  }, [navigate]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await projectService.getProjects();
      setProjects(response.data.projects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError('Failed to load repositories. Make sure the backend is running and you have run the seed script.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    // Navigate to PR creation page
    navigate(`/projects/${projectId}/create-pr`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown 
                unreadCount={unreadCount} 
                onNotificationRead={fetchUnreadCount} 
              />
              <button
                onClick={() => navigate('/pull-requests')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              >
                <GitPullRequest className="w-4 h-4" />
                View Pull Requests
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Repositories
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Error loading repositories</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-2">
                Run this command in the backend folder: <code className="bg-red-100 px-2 py-1 rounded">npm run seed</code>
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading repositories...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No repositories found.</p>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Click the button below to add sample repositories:
                </p>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError(null);
                      await api.post('/projects/seed');
                      await fetchProjects();
                    } catch (err: any) {
                      setError('Failed to seed repositories. Make sure backend is running.');
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Add Sample Repositories
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Or run: <code className="bg-gray-100 px-2 py-1 rounded">npm run seed</code> in backend folder
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-orange-500 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Folder className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      Create Pull Request →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
