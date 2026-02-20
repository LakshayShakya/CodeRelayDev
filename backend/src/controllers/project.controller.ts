import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import ProjectFile from '../models/ProjectFile';
import { AppError } from '../middleware/errorHandler';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database connection not available') as AppError;
      error.statusCode = 503;
      throw error;
    }

    const projects = await Project.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      const error = new Error('Project not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get files for a project
// @route   GET /api/projects/:id/files
// @access  Public
export const getProjectFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const files = await ProjectFile.find({ projectId: id }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        files,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample projects (for development)
// @route   POST /api/projects/seed
// @access  Public
export const seedProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database connection not available') as AppError;
      error.statusCode = 503;
      throw error;
    }

    // Clear existing data
    await Project.deleteMany({});
    await ProjectFile.deleteMany({});

    // Create projects
    const project1 = await Project.create({
      name: 'Inventory System',
      description: 'Warehouse management project',
    });

    const project2 = await Project.create({
      name: 'E-Commerce Platform',
      description: 'Online shopping application with payment integration',
    });

    const project3 = await Project.create({
      name: 'Task Management App',
      description: 'Collaborative task tracking and project management tool',
    });

    // Create files for project1
    const folder1 = await ProjectFile.create({
      projectId: project1._id,
      name: 'src',
      type: 'folder',
      parentId: null,
    });

    await ProjectFile.create({
      projectId: project1._id,
      name: 'index.js',
      type: 'file',
      parentId: folder1._id,
      content: "console.log('Hello World');",
    });

    await ProjectFile.create({
      projectId: project1._id,
      name: 'package.json',
      type: 'file',
      parentId: null,
      content: JSON.stringify({
        name: 'inventory-system',
        version: '1.0.0',
      }, null, 2),
    });

    const projects = await Project.find();
    
    res.status(201).json({
      success: true,
      message: 'Projects seeded successfully',
      data: {
        projects,
        count: projects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
