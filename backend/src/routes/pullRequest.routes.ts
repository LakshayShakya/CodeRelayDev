import express from 'express';
import { body } from 'express-validator';
import {
  createPullRequest,
  getPullRequests,
  getReviewers,
  approvePullRequest,
  rejectPullRequest,
} from '../controllers/pullRequest.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Validation rules for creating a pull request
const createPRValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('reviewerId')
    .notEmpty()
    .withMessage('Reviewer ID is required')
    .isMongoId()
    .withMessage('Invalid reviewer ID'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];

// Apply authentication middleware to all routes
router.use(protect);

// POST /api/pull-requests - Create a new pull request
router.post('/', createPRValidation, createPullRequest);

// GET /api/pull-requests - Get pull requests for the authenticated user
router.get('/', getPullRequests);

// GET /api/pull-requests/reviewers - Get available reviewers
router.get('/reviewers', getReviewers);

// PUT /api/pull-requests/:id/approve - Approve a pull request
router.put('/:id/approve', approvePullRequest);

// PUT /api/pull-requests/:id/reject - Reject a pull request
router.put('/:id/reject', rejectPullRequest);

export default router;
