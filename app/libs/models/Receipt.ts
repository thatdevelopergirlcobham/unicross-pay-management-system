import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  paymentId: mongoose.Types.ObjectId;
  receiptId: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  matricNo: string;
  amountPaid: number;
  description: string;
  paymentMethod: string;
  status: 'Paid' | 'Refunded' | 'Cancelled';
  issuedDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema: Schema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  receiptId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  matricNo: {
    type: String,
    required: true,
    trim: true
  },
  amountPaid: {
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
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Refunded', 'Cancelled'],
    default: 'Paid'
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
ReceiptSchema.index({ receiptId: 1 });
ReceiptSchema.index({ studentId: 1 });
ReceiptSchema.index({ matricNo: 1 });
ReceiptSchema.index({ issuedDate: 1 });
ReceiptSchema.index({ paymentId: 1 });

export default mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
