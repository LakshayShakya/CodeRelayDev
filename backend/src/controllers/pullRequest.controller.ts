import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import PullRequest from '../models/PullRequest';
import User from '../models/User';
import Project from '../models/Project';
import Notification from '../models/Notification';

// Create a new pull request
export const createPullRequest = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { title, description, branch, projectId, reviewerId, attachments } = req.body;
    const authorId = req.user?.id; // Assuming user ID is attached to request from auth middleware

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify reviewer exists and has reviewer role
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || reviewer.role !== 'reviewer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewer. User must have reviewer role.',
      });
    }

    // Create pull request
    const pullRequest = new PullRequest({
      title,
      description,
      branch,
      projectId,
      authorId,
      reviewerId,
      attachments: attachments || [],
    });

    await pullRequest.save();

    // Populate the response with related data
    await pullRequest.populate([
      { path: 'projectId', select: 'name description' },
      { path: 'authorId', select: 'name email' },
      { path: 'reviewerId', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Pull request created successfully',
      data: pullRequest,
    });
  } catch (error: any) {
    console.error('Error creating pull request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all pull requests for a user (either as author or reviewer)
export const getPullRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, status } = req.query;

    // Build query
    const query: any = {
      $or: [{ authorId: userId }, { reviewerId: userId }],
    };

    if (projectId) {
      query.projectId = projectId;
    }

    if (status) {
      query.status = status;
    }

    const pullRequests = await PullRequest.find(query)
      .populate('projectId', 'name description')
      .populate('authorId', 'name email')
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pullRequests,
    });
  } catch (error: any) {
    console.error('Error fetching pull requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get reviewers for a project
export const getReviewers = async (req: Request, res: Response) => {
  try {
    const reviewers = await User.find({ role: 'reviewer' })
      .select('name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: reviewers,
    });
  } catch (error: any) {
    console.error('Error fetching reviewers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Approve a pull request
export const approvePullRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    const pullRequest = await PullRequest.findById(id);

    if (!pullRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pull request not found',
      });
    }

    // Check if the authenticated user is the assigned reviewer
    if (pullRequest.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this pull request',
      });
    }

    // Update status to approved
    pullRequest.status = 'approved';
    await pullRequest.save();

    // Create notification for the author
    await Notification.create({
      userId: pullRequest.authorId,
      pullRequestId: pullRequest._id,
      type: 'approved',
      title: 'Pull Request Approved',
      message: `Your pull request "${pullRequest.title}" has been approved by ${pullRequest.reviewerId}`,
    });

    // Populate the response with related data
    await pullRequest.populate([
      { path: 'projectId', select: 'name description' },
      { path: 'authorId', select: 'name email' },
      { path: 'reviewerId', select: 'name email' },
    ]);

    res.json({
      success: true,
      message: 'Pull request approved successfully',
      data: pullRequest,
    });
  } catch (error: any) {
    console.error('Error approving pull request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Reject a pull request
export const rejectPullRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    const pullRequest = await PullRequest.findById(id);

    if (!pullRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pull request not found',
      });
    }

    // Check if the authenticated user is the assigned reviewer
    if (pullRequest.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this pull request',
      });
    }

    // Update status to rejected
    pullRequest.status = 'rejected';
    await pullRequest.save();

    // Create notification for the author
    await Notification.create({
      userId: pullRequest.authorId,
      pullRequestId: pullRequest._id,
      type: 'rejected',
      title: 'Pull Request Rejected',
      message: `Your pull request "${pullRequest.title}" has been rejected by ${pullRequest.reviewerId}`,
    });

    // Populate the response with related data
    await pullRequest.populate([
      { path: 'projectId', select: 'name description' },
      { path: 'authorId', select: 'name email' },
      { path: 'reviewerId', select: 'name email' },
    ]);

    res.json({
      success: true,
      message: 'Pull request rejected successfully',
      data: pullRequest,
    });
  } catch (error: any) {
    console.error('Error rejecting pull request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
