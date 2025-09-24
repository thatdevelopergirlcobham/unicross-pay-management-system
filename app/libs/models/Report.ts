import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportType: 'Monthly Revenue' | 'Departmental Expenses' | 'Student Payments' | 'Financial Summary' | 'Audit Trail';
  title: string;
  description?: string;
  generatedBy: mongoose.Types.ObjectId;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: Schema.Types.Mixed;
  status: 'Generated' | 'Processing' | 'Failed';
  filePath?: string;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  reportType: {
    type: String,
    enum: ['Monthly Revenue', 'Departmental Expenses', 'Student Payments', 'Financial Summary', 'Audit Trail'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['Generated', 'Processing', 'Failed'],
    default: 'Generated'
  },
  filePath: {
    type: String,
    trim: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes
ReportSchema.index({ reportType: 1 });
ReportSchema.index({ generatedBy: 1 });
ReportSchema.index({ 'dateRange.start': 1 });
ReportSchema.index({ 'dateRange.end': 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
