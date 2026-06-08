// src/pages/Transactions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import TransactionTable from '../components/TransactionTable';
import TransactionModal from '../components/TransactionModal';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowDownToLine,
  Camera
} from 'lucide-react';
import Tesseract from 'tesseract.js';

// List of categories for dropdown lists and validation checks
const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other Income',
  'Food & Dining', 'Rent & Utilities', 'Transportation', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Miscellaneous'
];

/**
 * Transactions Page: Coordinates transaction management activities.
 * Handles database listing, CRUD triggers, OCR image analysis, and CSV exporting.
 */
const Transactions = () => {
  const { apiCall } = useAuth();
  const { showAlert } = useAlert();

  // Transactions list states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Stores target transaction for edit pre-fills

  // Filtering configurations states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // OCR optical scanning state
  const [scanning, setScanning] = useState(false);

  /**
   * Action: Queries backend transactions database
   */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/transactions');
      setTransactions(res.data);
    } catch (err) {
      showAlert(err.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch list on mounting
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Opens dialog for adding a new item
  const handleOpenAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  // Opens dialog with existing properties pre-filled for editing
  const handleOpenEditModal = (tx) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  /**
   * Action: Handles deletion of transaction objects
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await apiCall(`/transactions/${id}`, { method: 'DELETE' });
      showAlert('Transaction deleted successfully', 'success');
      fetchTransactions();
    } catch (err) {
      showAlert(err.message || 'Failed to delete transaction', 'error');
    }
  };

  /**
   * Action: Handles submission of Modal form dialog for both CREATE and EDIT pathways
   */
  const handleModalSubmit = async (formData) => {
    try {
      if (selectedTransaction && selectedTransaction._id) {
        // Edit mode (PUT operation)
        await apiCall(`/transactions/${selectedTransaction._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showAlert('Transaction updated successfully', 'success');
      } else {
        // Create mode (POST operation)
        await apiCall('/transactions', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showAlert('Transaction added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      showAlert(err.message || 'Failed to save transaction', 'error');
    }
  };

  /**
   * Memoized calculations: Filter and Sort transactions array client-side for immediate responsive feeds.
   * Runs only when transactions, search strings, type, category, or sorting configurations adjust.
   */
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // 1. Search Query text mapping
        const matchesSearch =
          tx.title.toLowerCase().includes(search.toLowerCase()) ||
          (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()));

        // 2. Type matching (income vs expense vs all)
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;

        // 3. Category matching
        const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        // Apply selected sort metrics
        if (sortBy === 'date_desc') {
          return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'date_asc') {
          return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        } else if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  /**
   * Action: Converts filtered transactions list into a CSV string and downloads it.
   */
  const handleDownload = () => {
    try {
      // Define CSV headers
      const rows = [
        ['Title', 'Amount', 'Type', 'Category', 'Date', 'Description'],
        ...filteredTransactions.map(tx => [
          tx.title || '',
          tx.amount != null ? tx.amount : '',
          tx.type || '',
          tx.category || '',
          tx.date ? new Date(tx.date).toISOString() : '',
          tx.description ? tx.description.replace(/\n/g, ' ') : '' // sanitize line breaks
        ])
      ];

      // Build spreadsheet CSV structure, escaping quotes and separating columns with commas
      const csvContent = rows.map(r => r.map(cell => {
        const cellStr = String(cell).replace(/"/g, '""'); // escape internal quotes
        return `"${cellStr}"`;
      }).join(',')).join('\n');

      // Generate local object URL blob and trigger click download event
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showAlert('CSV download started', 'success');
    } catch (err) {
      showAlert('Failed to generate CSV', 'error');
    }
  };

  /**
   * Action: Launches OCR file scanner flow.
   * Invokes Tesseract.js engine on selected images and runs regex parsing to prefill transactional fields.
   */
  const handleScanReceipt = async () => {
    try {
      // Programmatically launch hidden file upload selector
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        try {
          // Initialize optical character recognition using Tesseract.js engine
          const { data: { text } } = await Tesseract.recognize(file, 'eng');

          // Parse read plaintext using regex parser logic
          const parsed = parseReceiptText(text);
          
          // Prefill form modal payload
          const prefill = {
            title: parsed.merchant || parsed.title || 'Scanned Receipt',
            amount: parsed.amount || 0,
            type: 'expense',
            category: parsed.category || 'Miscellaneous',
            date: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
            description: `Scanned receipt text:\n${text.slice(0, 1000)}`
          };

          setSelectedTransaction(prefill);
          setIsModalOpen(true);
          showAlert('Receipt scanned — please review and save', 'success');
        } catch (ocrErr) {
          console.error(ocrErr);
          showAlert('Failed to scan receipt. Try a clearer photo.', 'error');
        } finally {
          setScanning(false);
        }
      };
      fileInput.click();
    } catch (err) {
      showAlert('Receipt scanner failed to start', 'error');
    }
  };

  /**
   * Helper: Runs regular expressions and keywords analysis to parse receipt amounts, merchant titles, and category types.
   * @param {string} text - Plain text read by the OCR scanner
   * @returns {Object} Extracted data properties
   */
  const parseReceiptText = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Heuristics: Extract potential monetary values (currencies match, picks the highest as total bill)
    const amountCandidates = [];
    const amountRegex = /(?:₹|\$|USD|INR|Rs\.?|EUR|€)?\s*([0-9]+(?:[.,][0-9]{2})?)/g;
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      const raw = match[1].replace(',', '');
      const val = parseFloat(raw);
      if (!isNaN(val)) amountCandidates.push(val);
    }
    const amount = amountCandidates.length ? Math.max(...amountCandidates) : null;

    // Heuristics: Extract dates matching standard calendar templates (YYYY-MM-DD or DD/MM/YYYY)
    const dateRegexes = [
      /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/,
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/,
      /\b([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})\b/
    ];
    let foundDate = null;
    for (const re of dateRegexes) {
      const dmatch = text.match(re);
      if (dmatch) {
        const ds = dmatch[1];
        const parsed = Date.parse(ds);
        if (!isNaN(parsed)) {
          foundDate = new Date(parsed).toISOString();
          break;
        } else {
          // Manual parsing split for dd/mm/yyyy structures
          const parts = ds.split(/[-\/]/);
          if (parts.length === 3) {
            let [p1, p2, p3] = parts;
            if (p1.length === 4) {
              const iso = `${p1}-${p2.padStart(2,'0')}-${p3.padStart(2,'0')}`;
              const parsed2 = Date.parse(iso);
              if (!isNaN(parsed2)) {
                foundDate = new Date(parsed2).toISOString();
                break;
              }
            } else {
              const iso = `20${p3.length === 2 ? p3 : p3}-${p2.padStart(2,'0')}-${p1.padStart(2,'0')}`;
              const parsed2 = Date.parse(iso);
              if (!isNaN(parsed2)) {
                foundDate = new Date(parsed2).toISOString();
                break;
              }
            }
          }
        }
      }
    }

    // Heuristics: Extract merchant name (prefers first non-numeric header line)
    let merchant = null;
    if (lines.length) {
      merchant = lines.find(l => /[A-Za-z]/.test(l) && l.length > 2) || lines[0];
      merchant = merchant.replace(/^[^A-Za-z]+/, '').slice(0, 60); // strip numeric icons
    }

    // Heuristics: Map keywords to matching category labels
    const lower = text.toLowerCase();
    let category = null;
    if (/restaurant|cafe|dine|food|burger|pizza|coffee/.test(lower)) category = 'Food & Dining';
    else if (/uber|ola|taxi|cab|transport|bus|railway|metro/.test(lower)) category = 'Transportation';
    else if (/rent|apartment|utility|electricity|water|gas/.test(lower)) category = 'Rent & Utilities';
    else if (/pharmacy|clinic|hospital|doctor|medicine/.test(lower)) category = 'Healthcare';
    else if (/book|course|tuition|school|college|university/.test(lower)) category = 'Education';
    else category = 'Miscellaneous';

    return {
      amount,
      date: foundDate,
      merchant,
      category
    };
  };

  return (
    <div className="space-y-6">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Transactions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage, filter, and review all your income and expenses.</p>
        </div>

        {/* Action Controls buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-500/10 transition"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition"
            title="Download visible transactions as CSV"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download CSV
          </button>

          <button
            onClick={handleScanReceipt}
            disabled={scanning}
            className={`flex items-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition ${scanning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Scan a receipt image to prefill a transaction"
          >
            <Camera className="h-4 w-4" />
            {scanning ? 'Scanning...' : 'Scan Receipt'}
          </button>
        </div>
      </div>

      {/* Filters Form Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/15 border border-slate-900 rounded-2xl p-4">

        {/* 1. Search Query input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-9 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-500 transition"
          />
        </div>

        {/* 2. Type Filter Select */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="h-4 w-4" />
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-955 pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-primary-500 transition"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* 3. Category Filter Select */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Filter className="h-4 w-4" />
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-955 pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-primary-500 transition"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sorting Parameters Select */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <ArrowUpDown className="h-4 w-4" />
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-955 pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-primary-500 transition"
          >
            <option value="date_desc">Date: Latest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>

      </div>

      {/* Main Table view viewport */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-medium">
          Loading transactions list...
        </div>
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      )}

      {/* Adding/Editing Dialog form Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleModalSubmit}
        transaction={selectedTransaction}
      />

    </div>
  );
};

export default Transactions;
