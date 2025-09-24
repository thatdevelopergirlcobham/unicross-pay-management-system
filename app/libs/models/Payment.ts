import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  matricNo: string;
  studentName: string;
  amount: number;
  description: string;
  paymentMethod: 'Paystack' | 'Flutterwave' | 'Bank Transfer' | 'Cash' | 'Online';
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionRef?: string;
  paymentDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matricNo: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
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
  paymentMethod: {
    type: String,
    enum: ['Paystack', 'Flutterwave', 'Bank Transfer', 'Cash', 'Online'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionRef: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
PaymentSchema.index({ studentId: 1 });
PaymentSchema.index({ matricNo: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ paymentDate: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
