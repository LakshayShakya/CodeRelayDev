import express, { Router } from 'express';
import {
  getProjects,
  getProjectById,
  getProjectFiles,
  seedProjects,
} from '../controllers/project.controller';

const router: Router = express.Router();

// Public routes
router.get('/', getProjects);
router.post('/seed', seedProjects); // Seed endpoint
router.get('/:id', getProjectById);
router.get('/:id/files', getProjectFiles);

export default router;
