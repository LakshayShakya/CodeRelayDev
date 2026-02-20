import api from './api';

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  _id: string;
  projectId: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  content: string | null;
}

export const projectService = {
  getProjects: async (): Promise<{ success: boolean; data: { projects: Project[] } }> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id: string): Promise<{ success: boolean; data: { project: Project } }> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getProjectFiles: async (id: string): Promise<{ success: boolean; data: { files: ProjectFile[] } }> => {
    const response = await api.get(`/projects/${id}/files`);
    return response.data;
  },
};
