import mongoose from 'mongoose';

/**
 * Transaction Schema
 * Represents financial operations: income earned or expenses paid.
 */
const transactionSchema = new mongoose.Schema(
  {
    // Reference to the user who recorded this transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Short title / name of the transaction (e.g. "Grocery Shopping")
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
    },
    // The amount in rupees (₹)
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'], // Ensures positive values
    },
    // Transaction type distinction
    type: {
      type: String,
      required: [true, 'Transaction type is required (income or expense)'],
      enum: ['income', 'expense'], // Only accepts 'income' or 'expense'
    },
    // Expense or Income classification category (e.g. "Food", "Salary", "Rent")
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    // The date transaction occurred (defaults to current timestamp)
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Date is required'],
    },
    // Optional details or description about the transaction
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    // Auto-generates createdAt and updatedAt fields
    timestamps: true,
  }
);

export default mongoose.model('Transaction', transactionSchema);
