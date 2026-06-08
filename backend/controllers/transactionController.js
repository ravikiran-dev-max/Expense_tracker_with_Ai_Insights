import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Helper Function: Evaluates current month's expenses against the user's budget.
 * Triggers warnings (at 80% capacity) and emergency alerts (at 100% capacity) in the user notification inbox.
 * @param {string} userId - ID of the target user
 */
const checkBudgetLimit = async (userId) => {
  try {
    const user = await User.findById(userId);
    // Exit if user does not exist or has not configured a budget limit (0 or negative)
    if (!user || !user.monthlyBudget || user.monthlyBudget <= 0) {
      return;
    }

    const today = new Date();
    // Calculate calendar boundaries for the current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Sum user's expenses for the current calendar month using Mongoose aggregation
    const expenseAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }, // Sums the 'amount' field
        },
      },
    ]);

    const totalExpenses = expenseAggregation.length > 0 ? expenseAggregation[0].total : 0;
    const budget = user.monthlyBudget;

    // Check 100% budget limit threshold
    if (totalExpenses >= budget) {
      const msg100 = `Alert: You have exceeded your monthly budget of ₹${budget}! Total spending this month: ₹${totalExpenses.toFixed(2)}.`;
      
      // Look for an existing 100% alert logged in the current calendar month
      const existing100 = await Notification.findOne({
        userId,
        type: 'warning',
        message: { $regex: 'exceeded your monthly budget' },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Avoid spamming the inbox by creating the notification only once per month
      if (!existing100) {
        await Notification.create({
          userId,
          message: msg100,
          type: 'warning',
        });
      }
    } 
    // Check 80% budget limit threshold
    else if (totalExpenses >= budget * 0.8) {
      const msg80 = `Warning: You have reached 80% of your monthly budget (₹${budget})! Total spending this month: ₹${totalExpenses.toFixed(2)}.`;
      
      // Look for an existing 80% alert logged in the current calendar month
      const existing80 = await Notification.findOne({
        userId,
        type: 'warning',
        message: { $regex: 'reached 80% of your monthly budget' },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Avoid spamming the inbox by creating the notification only once per month
      if (!existing80) {
        await Notification.create({
          userId,
          message: msg80,
          type: 'warning',
        });
      }
    }
  } catch (error) {
    console.error('Error checking budget limits:', error);
  }
};

/**
 * @desc    Get all transactions for the authenticated user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
  try {
    // Sort transactions by date descending (latest first) to display in list views
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    
    return res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single transaction details by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensures a user can only access their own files/records
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    return res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    // Return friendly error response if URL query contains malformed MongoDB ID
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Transaction ID' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new transaction (income or expense)
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Validate incoming fields
    if (!title || !amount || !type || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, amount, type and category' });
    }

    // Save record to MongoDB
    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date || new Date(),
      description: description || '',
    });

    // Check budget thresholds asynchronously if the transaction is an expense
    if (type === 'expense') {
      checkBudgetLimit(req.user._id);
    }

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing transaction by ID
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Find transaction and verify ownership
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Update fields (fall back to previous values if not modified in request)
    transaction.title = title || transaction.title;
    transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;

    const updatedTransaction = await transaction.save();

    // Re-verify budget limits if modified transaction is (or changed to) an expense
    if (updatedTransaction.type === 'expense' || type === 'expense') {
      checkBudgetLimit(req.user._id);
    }

    return res.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Transaction ID' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a transaction by ID
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Remove transaction record from database
    await Transaction.deleteOne({ _id: req.params.id });

    // Recalculate monthly totals for warning flags
    if (transaction.type === 'expense') {
      checkBudgetLimit(req.user._id);
    }

    return res.json({
      success: true,
      message: 'Transaction removed successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Transaction ID' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
