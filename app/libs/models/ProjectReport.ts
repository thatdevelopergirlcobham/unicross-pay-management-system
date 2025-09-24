import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectReport extends Document {
  project: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  title: string;
  content: string;
  attachmentUrl?: string;
  status: 'Submitted' | 'Reviewed' | 'Approved' | 'Rejected';
  feedback?: string;
  submissionDate: Date;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectReportSchema: Schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  attachmentUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'Reviewed', 'Approved', 'Rejected'],
    default: 'Submitted'
  },
  feedback: {
    type: String
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
ProjectReportSchema.index({ project: 1 });
ProjectReportSchema.index({ student: 1 });
ProjectReportSchema.index({ status: 1 });
ProjectReportSchema.index({ submissionDate: 1 });

export default mongoose.models.ProjectReport || mongoose.model<IProjectReport>('ProjectReport', ProjectReportSchema);
