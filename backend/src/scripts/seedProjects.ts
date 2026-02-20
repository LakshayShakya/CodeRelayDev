import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project';
import ProjectFile from '../models/ProjectFile';
import { connectDatabase } from '../config/database';

dotenv.config();

const seedProjects = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    
    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Clearing existing data...');
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

    console.log('✅ Projects seeded successfully!');
    console.log(`Created ${await Project.countDocuments()} projects`);
    console.log(`Created ${await ProjectFile.countDocuments()} files`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
};

seedProjects();
