import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  supervisor: mongoose.Types.ObjectId;
  department: string;
  maxStudents: number;
  assignedStudents: mongoose.Types.ObjectId[];
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  requirements?: string;
  deliverables?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  assignedStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  requirements: {
    type: String,
    trim: true
  },
  deliverables: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Create indexes
ProjectSchema.index({ supervisor: 1 });
ProjectSchema.index({ department: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ assignedStudents: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
