import React from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Activity, 
  AlertCircle, 
  Coins, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

/**
 * AiAnalytics Component: Renders AI-driven financial insights in a card container.
 * Displays risk level evaluation, a monthly spending forecast, and actionable savings tips.
 * @param {Object} aiAnalytics - Insights data from backend, containing `{ isMock, data }`
 */
const AiAnalytics = ({ aiAnalytics }) => {
  // Render loading fallback if data has not yet loaded
  if (!aiAnalytics) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-8 text-center text-slate-500 backdrop-blur-sm">
        <BrainCircuit className="h-8 w-8 text-slate-700 mx-auto mb-3 animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">AI Diagnostics Pending</p>
        <p className="text-[11px] text-slate-500">Log transactions and request an update to generate financial insights.</p>
      </div>
    );
  }

  // Destructure response payload
  const { isMock, data } = aiAnalytics;
  const { 
    summary = "No summary available.", 
    riskLevel = "Low", 
    riskExplanation = "No explanation provided.", 
    futureOutlook = "No outlook forecast is available.", 
    tips = [], 
    predictedExpense = 0 
  } = data || {};

  /**
   * Helper: Matches risk levels to specific Tailwind CSS color themes & visual progress meters
   * @param {'Low'|'Medium'|'High'} level 
   * @returns {Object} styling configuration classes
   */
  const getRiskStyles = (level) => {
    switch (level) {
      case 'High':
        return {
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          bg: 'bg-rose-500/5',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
          badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          percentage: 'w-full bg-rose-500' // full width bar
        };
      case 'Medium':
        return {
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          bg: 'bg-amber-500/5',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          percentage: 'w-2/3 bg-amber-500' // 66% width bar
        };
      case 'Low':
      default:
        return {
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          bg: 'bg-emerald-500/5',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          percentage: 'w-1/3 bg-emerald-500' // 33% width bar
        };
    }
  };

  const riskStyles = getRiskStyles(riskLevel);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/25 p-6 space-y-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-700" />

      {/* Header: Pulsating AI Icon & Status indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)] animate-pulse">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              AI Financial Diagnostics
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated analytics & savings optimization engine</p>
          </div>
        </div>
        
        {/* Engine status indicator (Differentiates real AI response from local rule-based fallback) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isMock ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-850 px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              LOCAL ENGINE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[9px] font-bold text-indigo-400 uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.1)]">
              <Zap className="h-3 w-3 text-indigo-400 animate-bounce-subtle" />
              AI ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="space-y-4 relative z-10">
        
        {/* Card: Risk Assessment Panel */}
        <div className={`rounded-xl border p-4 text-xs leading-relaxed transition-all duration-300 ${riskStyles.border} ${riskStyles.bg} ${riskStyles.glow}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-4.5 w-4.5 shrink-0 ${riskStyles.text}`} />
              <span className="font-bold uppercase tracking-wider text-[10px] text-white">
                Risk Analysis
              </span>
            </div>
            
            {/* Risk Category Badge */}
            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${riskStyles.badge}`}>
              {riskLevel} Risk
            </span>
          </div>

          {/* Explanation Text */}
          <p className="text-slate-300 font-medium leading-relaxed mb-3">
            {riskExplanation || summary}
          </p>

          {/* Graphic Risk progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500">
              <span>RISK SCALE</span>
              <span className={riskStyles.text}>{riskLevel.toUpperCase()}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-950/60 overflow-hidden border border-slate-900">
              <div className={`h-full rounded-full transition-all duration-1000 ${riskStyles.percentage}`} />
            </div>
          </div>
        </div>

        {/* Info Grid: Spending Outlook & Next Month Projection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Card: Spending Outlook */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition duration-300 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <h5 className="font-bold text-slate-400 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5 text-primary-400" />
                Spending Outlook
              </h5>
              <p className="text-slate-300 leading-relaxed pt-1">{futureOutlook}</p>
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 border-t border-slate-900/60 pt-2">
              <TrendingUp className="h-3 w-3" />
              Updated dynamically based on logs
            </div>
          </div>

          {/* Card: Next Month Predictive Forecast */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition duration-300 flex flex-col justify-between space-y-3 shadow-[0_0_20px_rgba(99,102,241,0.02)]">
            <div className="space-y-2">
              <h5 className="font-bold text-slate-400 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <Coins className="h-3.5 w-3.5 text-purple-400" />
                Predictive Forecast
              </h5>
              <p className="text-slate-300 leading-relaxed">
                Projected next month expenses (moving averages calculation):
              </p>
              <div className="inline-flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-white bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/25 tracking-tight shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  ₹{predictedExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-indigo-455 font-bold flex items-center gap-1 border-t border-slate-900/60 pt-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400 animate-bounce-subtle" />
              PROJECTION MODEL ACTIVE
            </div>
          </div>
        </div>

        {/* Actionable correction guidelines */}
        {tips && tips.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>SUGGESTED CORRECTION PATHS</span>
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((tip, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed bg-slate-950/30 hover:bg-slate-900/40 hover:scale-[1.01] hover:border-slate-800/80 transition-all duration-300 p-3.5 rounded-xl border border-slate-850"
                >
                  {/* Styled index indicator */}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiAnalytics;
