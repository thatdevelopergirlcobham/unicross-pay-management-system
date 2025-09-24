import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  supervisor: mongoose.Types.ObjectId;
  department: string;
  maxStudents: number;
  assignedStudents: mongoose.Types.ObjectId[];
  status: 'Open' | 'Closed' | 'Completed';
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
    default: 1,
    min: 1
  },
  assignedStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Completed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

// Create indexes
ProjectSchema.index({ supervisor: 1 });
ProjectSchema.index({ department: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
