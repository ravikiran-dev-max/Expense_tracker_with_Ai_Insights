import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

// Pre-defined transaction classifications for validation and filtering dropdown selection
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other Income'];
const EXPENSE_CATEGORIES = ['Food & Dining', 'Rent & Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Travel', 'Miscellaneous'];

/**
 * TransactionModal Component: Multi-functional overlay modal to Add or Edit transaction objects.
 */
const TransactionModal = ({ isOpen, onClose, onSubmit, transaction }) => {
  // Input fields state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0], // Defaults to current date (YYYY-MM-DD)
    description: '',
  });

  const [errors, setErrors] = useState({}); // Stores validation errors for red alerts

  // Synchronize state when the target edit transaction parameter modifications occur
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
      });
    } else {
      // Clear form inputs if adding a new transaction
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setErrors({}); // Reset error objects
  }, [transaction, isOpen]);

  // Adjust categories dropdown depending on the selected transaction type (Income vs Expense)
  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: '', // Reset category selection to force valid choice
    }));
  };

  /**
   * Performs form field validation before submission
   * @returns {boolean} True if clean, false if fields are invalid
   */
  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Title is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      tempErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) tempErrors.category = 'Category is required';
    if (!formData.date) tempErrors.date = 'Date is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  /**
   * Form submit button event handler
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Select appropriate category list based on current active type
  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-slide-up overflow-hidden">
        
        {/* Header Panel */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            {transaction && transaction._id ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form panel */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle selector (Expense vs Income) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                  formData.type === 'expense'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md shadow-rose-500/5'
                    : 'bg-slate-850/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                  formData.type === 'income'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-855/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title entry field */}
          <div>
            <label htmlFor="tx-title" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Title
            </label>
            <input
              id="tx-title"
              type="text"
              placeholder="e.g. Grocery Store"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition ${
                errors.title ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* Amount & Date inputs grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount input */}
            <div>
              <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Amount (₹)
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition ${
                  errors.amount ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount}</p>}
            </div>

            {/* Date input */}
            <div>
              <label htmlFor="tx-date" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition ${
                  errors.date ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.date && <p className="mt-1 text-xs text-rose-400">{errors.date}</p>}
            </div>
          </div>

          {/* Category Dropdown select */}
          <div>
            <label htmlFor="tx-category" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              id="tx-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500 transition ${
                errors.category ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800'
              }`}
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-400">{errors.category}</p>}
          </div>

          {/* Description comments box */}
          <div>
            <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <textarea
              id="tx-desc"
              rows="2"
              placeholder="Add extra comments..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition resize-none"
            />
          </div>

          {/* Modal Buttons Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/10 hover:bg-primary-500 transition"
            >
              {transaction && transaction._id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {transaction && transaction._id ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
