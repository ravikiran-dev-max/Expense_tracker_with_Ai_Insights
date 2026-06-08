import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// Apply auth protection middleware to all transaction endpoints
router.use(protect);

// Routes mapping for "/"
// GET /api/transactions - Fetch all user transaction records
// POST /api/transactions - Create new transaction (checks budget limits)
router.route('/')
  .get(getTransactions)
  .post(createTransaction);

// Routes mapping for "/:id"
// GET /api/transactions/:id - Fetch single transaction details
// PUT /api/transactions/:id - Update transaction details (re-checks budget)
// DELETE /api/transactions/:id - Remove transaction record
router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
