import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectFile extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  type: 'folder' | 'file';
  parentId: mongoose.Types.ObjectId | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema<IProjectFile>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['folder', 'file'],
      required: [true, 'File type is required'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectFile',
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProjectFileSchema.index({ projectId: 1 });
ProjectFileSchema.index({ parentId: 1 });

const ProjectFile = mongoose.model<IProjectFile>('ProjectFile', ProjectFileSchema);

export default ProjectFile;
