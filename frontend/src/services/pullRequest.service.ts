import api from './api';

export interface PullRequest {
  _id: string;
  title: string;
  description: string;
  branch: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
  };
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
  reviewerId: {
    _id: string;
    name: string;
    email: string;
  };
  attachments: string[];
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Reviewer {
  _id: string;
  name: string;
  email: string;
}

export interface CreatePullRequestData {
  title: string;
  description: string;
  branch: string;
  projectId: string;
  reviewerId: string;
  attachments?: string[];
}

export const pullRequestService = {
  // Create a new pull request
  createPullRequest: async (data: CreatePullRequestData) => {
    const response = await api.post('/pull-requests', data);
    return response.data;
  },

  // Get pull requests for the authenticated user
  getPullRequests: async (projectId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    
    const response = await api.get(`/pull-requests?${params.toString()}`);
    return response.data;
  },

  // Get available reviewers
  getReviewers: async () => {
    const response = await api.get('/pull-requests/reviewers');
    return response.data;
  },

  // Approve a pull request
  approvePullRequest: async (id: string) => {
    const response = await api.put(`/pull-requests/${id}/approve`);
    return response.data;
  },

  // Reject a pull request
  rejectPullRequest: async (id: string) => {
    const response = await api.put(`/pull-requests/${id}/reject`);
    return response.data;
  },
};
