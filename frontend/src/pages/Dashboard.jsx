import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, AlertCircle, RefreshCw } from 'lucide-react';
import AiAnalytics from '../components/AiAnalytics';

// Color palette configuration for Pie chart cells (harmonious HSL and Indigo/Slate offsets)
const COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#a855f7', '#64748b', '#06b6d4', '#f43f5e'];

/**
 * Dashboard Page: Central operations workspace.
 * Queries financial analytics endpoints, formats timeline stats, and renders Recharts data graphs.
 */
const Dashboard = () => {
  const { user, apiCall } = useAuth();
  const [chartType, setChartType] = useState('area'); // Controls graph toggle view (area | bar | line)
  
  // Dashboard state values
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0, savingsRate: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  /**
   * Action: Queries all required reporting endpoints in parallel
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch consolidated report summaries
      const reportRes = await apiCall('/reports/summary');
      setSummary(reportRes.data.summary);
      
      // Filter out income categories to only represent expense allocations in the pie distribution
      const expensesOnly = reportRes.data.categoryBreakdown.filter(c => c.type === 'expense');
      setCategoryBreakdown(expensesOnly);
      setMonthlyHistory(reportRes.data.monthlyHistory);

      // 2. Fetch AI-driven insights (Gemini / Ollama engine)
      const aiRes = await apiCall('/ai/analytics');
      setAiAnalytics(aiRes);

      // 3. Fetch recent system warnings and budget alerts
      const notifRes = await apiCall('/notifications');
      setNotifications(notifRes.data.slice(0, 4)); // Show top 4 notifications

      // 4. Fetch transactions list (slice to top 5 recent items)
      const txRes = await apiCall('/transactions');
      setRecentTransactions(txRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run fetch loop on component mounting
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate consumed percentage of user budget
  const budgetUsagePercent = user?.monthlyBudget > 0 
    ? Math.round((summary.totalExpenses / user.monthlyBudget) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium animate-pulse">Computing financial statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome & Refresh Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Welcome back, {user?.username}. Here is your financial overview.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Records
        </button>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Net Balance */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">₹{summary.netBalance.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Savings Rate: {summary.savingsRate}%</p>
        </div>

        {/* Metric 2: Total Income */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-3">₹{summary.totalIncome.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Earned this year</p>
        </div>

        {/* Metric 3: Total Expenses */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-3">₹{summary.totalExpenses.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Spent this year</p>
        </div>

        {/* Metric 4: Budget status indicator */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Status</span>
            <span className="text-xs font-bold text-slate-300">
              {user?.monthlyBudget > 0 ? `₹${user.monthlyBudget}` : 'No limit'}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>{budgetUsagePercent}% consumed</span>
              <span>
                {user?.monthlyBudget > 0 
                  ? `₹${Math.max(0, user.monthlyBudget - summary.totalExpenses).toFixed(0)} left` 
                  : 'N/A'}
              </span>
            </div>
            {/* Budget bar colored dynamically depending on consumption scale */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsagePercent >= 100 
                    ? 'bg-rose-500' 
                    : budgetUsagePercent >= 80 
                      ? 'bg-amber-500' 
                      : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card: Cashflow Trend Line/Bar/Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Monthly Cashflow Trend</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Chronological summary of income vs expenses</p>
            </div>
            {/* Chart toggle controls */}
            <div className="flex gap-1.5 self-start bg-slate-950 p-1 rounded-xl border border-slate-900">
              {['area', 'bar', 'line'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg capitalize transition ${
                    chartType === type
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-72 w-full">
            {monthlyHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Insufficient data to plot timeline. Log transactions in different months to view trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* 1. Area Chart rendering */}
                {chartType === 'area' && (
                  <AreaChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                  </AreaChart>
                )}
                {/* 2. Bar Chart rendering */}
                {chartType === 'bar' && (
                  <BarChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
                {/* 3. Line Chart rendering */}
                {chartType === 'line' && (
                  <LineChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Card: Expense Distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Expense Distribution</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Category percentages of overall spending</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            {categoryBreakdown.length === 0 ? (
              <div className="text-xs text-slate-500">No expense records found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Categories Legend Grid list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] max-h-24 overflow-y-auto pr-1">
            {categoryBreakdown.map((cat, index) => (
              <div key={cat.category} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-400 truncate">{cat.category}</span>
                <span className="text-white ml-auto font-semibold">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: AI Analysis & System Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Analytics Panel Column (Renders component detailing advice blocks) */}
        <div className="lg:col-span-2">
          <AiAnalytics aiAnalytics={aiAnalytics} />
        </div>

        {/* Card: Alerts and Notification Logs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Recent Alerts</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Budget limit alerts and milestones</p>
          </div>
          
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No alerts detected this month
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                    notif.type === 'warning'
                      ? 'bg-rose-955 border-rose-500/10 text-rose-300'
                      : 'bg-slate-900 border-slate-850 text-slate-300'
                  }`}
                >
                  <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${notif.type === 'warning' ? 'text-rose-400' : 'text-primary-400'}`} />
                  <div>
                    <p className="leading-normal">{notif.message}</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Card: Recent Transaction Logs list */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Recent Transactions</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Your last 5 transaction records</p>
          </div>
        </div>

        <div className="divide-y divide-slate-850">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions logged yet
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isIncome 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{tx.title}</p>
                      <p className="text-[9px] text-slate-500">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
