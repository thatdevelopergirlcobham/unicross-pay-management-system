import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  department: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  paymentDate?: Date;
  receiptRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  department: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  receiptRef: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
ExpenseSchema.index({ department: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ requestedBy: 1 });
ExpenseSchema.index({ approvedDate: 1 });
ExpenseSchema.index({ paymentDate: 1 });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
