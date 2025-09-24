import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectReport extends Document {
  project: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  reportType: 'Progress' | 'Final' | 'Milestone';
  title: string;
  content: string;
  attachments?: string[];
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  submittedDate?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedDate?: Date;
  feedback?: string;
  grade?: number;
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
  reportType: {
    type: String,
    enum: ['Progress', 'Final', 'Milestone'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  submittedDate: {
    type: Date
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedDate: {
    type: Date
  },
  feedback: {
    type: String,
    trim: true
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Create indexes
ProjectReportSchema.index({ project: 1 });
ProjectReportSchema.index({ student: 1 });
ProjectReportSchema.index({ reportType: 1 });
ProjectReportSchema.index({ status: 1 });
ProjectReportSchema.index({ submittedDate: -1 });
ProjectReportSchema.index({ reviewedBy: 1 });

export default mongoose.models.ProjectReport || mongoose.model<IProjectReport>('ProjectReport', ProjectReportSchema);
