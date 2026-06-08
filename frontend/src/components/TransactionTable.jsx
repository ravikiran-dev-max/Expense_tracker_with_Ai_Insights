import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

/**
 * TransactionTable Component: Displays lists of transactions with responsive layouts.
 * Renders a full data table on desktop screens and a card list on mobile screens.
 */
const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  // Empty data state layout
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-3">
          <Trash2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-400">No transactions recorded yet</p>
        <p className="text-xs text-slate-600 mt-1">Start by clicking the "Add Transaction" button!</p>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================================= */}
      {/* 1. Desktop Table Layout (>= md viewports) */}
      {/* ======================================================= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-sm">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <tr key={tx._id} className="hover:bg-slate-900/30 transition">
                  {/* Title & Description Column */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      {/* Icon indicator colored green for income, red for expense */}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        isIncome 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.title}</p>
                        {tx.description && <p className="text-xs text-slate-500 mt-0.5">{tx.description}</p>}
                      </div>
                    </div>
                  </td>
                  
                  {/* Category badge */}
                  <td className="px-6 py-4.5">
                    <span className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                      {tx.category}
                    </span>
                  </td>
                  
                  {/* Formatted Date */}
                  <td className="px-6 py-4.5 text-slate-400">
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  
                  {/* Amount with sign indicator */}
                  <td className={`px-6 py-4.5 text-right font-semibold text-base ${
                    isIncome ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isIncome ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </td>
                  
                  {/* Row Actions */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
                        title="Edit transaction"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ======================================================= */}
      {/* 2. Mobile Card List Layout (< md viewports) */}
      {/* ======================================================= */}
      <div className="md:hidden flex flex-col gap-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div
              key={tx._id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 flex flex-col gap-3 hover:border-slate-800 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Type icon */}
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isIncome 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{tx.title}</h4>
                    <p className="text-[10px] text-slate-500">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Mobile Amount */}
                <div className={`font-bold text-base ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </div>

              {/* Optional Description snippet */}
              {tx.description && (
                <p className="text-xs text-slate-500 bg-slate-950/40 p-2 rounded-lg leading-relaxed">
                  {tx.description}
                </p>
              )}

              {/* Category & Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                <span className="inline-flex items-center rounded-lg bg-slate-950 border border-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  {tx.category}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(tx)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 transition"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(tx._id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-950/10 border border-rose-900/30 rounded-lg px-2.5 py-1 transition"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;
