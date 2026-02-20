import mongoose, { Document, Schema } from 'mongoose';

export interface IPullRequest extends Document {
  title: string;
  description: string;
  branch: string;
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  attachments: string[];
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const PullRequestSchema = new Schema<IPullRequest>(
  {
    title: {
      type: String,
      required: [true, 'PR title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'PR description is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer ID is required'],
    },
    attachments: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PullRequestSchema.index({ projectId: 1 });
PullRequestSchema.index({ authorId: 1 });
PullRequestSchema.index({ reviewerId: 1 });
PullRequestSchema.index({ status: 1 });

const PullRequest = mongoose.model<IPullRequest>('PullRequest', PullRequestSchema);

export default PullRequest;
