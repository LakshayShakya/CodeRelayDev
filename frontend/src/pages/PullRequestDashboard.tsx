import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, GitPullRequest, Folder, Bell, User, LogOut, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { pullRequestService, PullRequest } from '../services/pullRequest.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'reviewer';
}

const PullRequestDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [activeNav, setActiveNav] = useState('pull-requests');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/auth');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchPullRequests();
  }, [navigate]);

  const fetchPullRequests = async () => {
    try {
      setError(null);
      const response = await pullRequestService.getPullRequests();
      setPullRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching pull requests:', error);
      setError('Failed to load pull requests');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const pendingPRs = pullRequests.filter(pr => pr.status === 'pending');
  const inReviewPRs = pullRequests.filter(pr => pr.status === 'in_review');
  const approvedPRs = pullRequests.filter(pr => pr.status === 'approved');
  const rejectedPRs = pullRequests.filter(pr => pr.status === 'rejected');

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">PR Dashboard</h2>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => {
              setActiveNav('home');
              navigate('/dashboard');
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
              activeNav === 'home' 
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">HOME</span>
          </button>
          
          <button
            onClick={() => setActiveNav('pull-requests')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
              activeNav === 'pull-requests' 
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <GitPullRequest className="w-5 h-5" />
            <span className="font-medium">PULL REQUEST</span>
            {pendingPRs.length > 0 && (
              <span className="ml-auto bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                {pendingPRs.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveNav('my-repo');
              navigate('/dashboard');
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
              activeNav === 'my-repo' 
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Folder className="w-5 h-5" />
            <span className="font-medium">MY REPO</span>
          </button>
          
          <button
            onClick={() => setActiveNav('notifications')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
              activeNav === 'notifications' 
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">NOTIFICATIONS</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Pull Requests</h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'profile'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                PROFILE
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'settings'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                SETTINGS
              </button>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading pull requests...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingPRs.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Review</p>
                      <p className="text-2xl font-bold text-gray-900">{inReviewPRs.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">{approvedPRs.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">{rejectedPRs.length}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Pending Pull Requests */}
              {pendingPRs.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Pending Review ({pendingPRs.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pendingPRs.map((pr) => (
                      <div key={pr._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{pr.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(pr.status)}`}>
                                {pr.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{pr.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Folder className="w-4 h-4" />
                                {pr.projectId.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitPullRequest className="w-4 h-4" />
                                {pr.branch}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Reviewer: {pr.reviewerId.name}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{new Date(pr.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs mt-1">{new Date(pr.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Pull Requests */}
              {pullRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Pull Requests</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pullRequests.map((pr) => (
                      <div key={pr._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{pr.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(pr.status)}`}>
                                {pr.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{pr.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Folder className="w-4 h-4" />
                                {pr.projectId.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitPullRequest className="w-4 h-4" />
                                {pr.branch}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {user.role === 'reviewer' ? `Author: ${pr.authorId.name}` : `Reviewer: ${pr.reviewerId.name}`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{new Date(pr.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs mt-1">{new Date(pr.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pullRequests.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <GitPullRequest className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pull requests found</h3>
                  <p className="text-gray-500">Create your first pull request to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequestDashboard;
