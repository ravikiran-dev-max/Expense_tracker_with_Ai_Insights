import Transaction from '../models/Transaction.js';

/**
 * @desc    Get income/expense summary reports aggregated by category and month
 * @route   GET /api/reports/summary
 * @access  Private
 */
const getReportSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all transactions recorded by the user, sorted chronologically (date ascending)
    const transactions = await Transaction.find({ userId }).sort({ date: 1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};
    const monthlyMap = {};

    // Single-pass loop to calculate totals, categorize, and group by calendar month
    transactions.forEach((tx) => {
      const amount = tx.amount;
      const type = tx.type;
      const category = tx.category || 'Uncategorized';
      const date = new Date(tx.date);
      
      // Compute Calendar Month Key (Format: YYYY-MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      // Sum overall income/expense totals
      if (type === 'income') {
        totalIncome += amount;
      } else if (type === 'expense') {
        totalExpenses += amount;
      }

      // Group totals by unique composite key: [Type]_[Category]
      const catKey = `${type}_${category}`;
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = {
          category,
          type,
          amount: 0,
        };
      }
      categoryMap[catKey].amount += amount;

      // Group totals by monthly key
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
        };
      }
      if (type === 'income') {
        monthlyMap[monthKey].income += amount;
      } else {
        monthlyMap[monthKey].expense += amount;
      }
    });

    // Format category distribution statistics, computing percentage ratios
    const categoryBreakdown = Object.values(categoryMap).map((item) => {
      const totalForType = item.type === 'income' ? totalIncome : totalExpenses;
      const percentage = totalForType > 0 ? Math.round((item.amount / totalForType) * 100) : 0;
      return {
        ...item,
        percentage,
      };
    });

    // Format monthly trend history, sorting month keys chronologically
    const monthlyHistory = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate overall statistics
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

    return res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netBalance,
          savingsRate: savingsRate > 0 ? savingsRate : 0, // Fallback negative rates to 0%
        },
        categoryBreakdown,
        monthlyHistory,
      },
    });
  } catch (error) {
    console.error('Error generating report summary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getReportSummary,
};
