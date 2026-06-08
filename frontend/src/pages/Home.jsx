import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Bot, BarChart3, Wallet, BrainCircuit } from 'lucide-react';

/**
 * Home Page (Landing Page): Introduces the application layout and features.
 * Conditionally renders links depending on whether a user session is active.
 */
const Home = () => {
  const { user } = useAuth(); // Consume current user session

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-950 text-white overflow-hidden flex flex-col justify-center">
      
      {/* Dynamic Background Glowing Circles */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/3" />

      {/* Hero container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Core Hero details */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge: Gemini AI integration status */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold text-primary-300 animate-fade-in shadow-inner">
            <SparkleIcon className="h-4.5 w-4.5 text-indigo-400" />
            Empowered by AI Insights
          </div>
          
          {/* Slogan with Telugu vernacular Easter Egg "Dabbulu Evvrike Oorike Ravu" (Money doesn't come easily) */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Know your Expenses <span className="bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">Intelligently.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-medium">
            SpendWise simplifies your daily expense logging, evaluates categories using premium interactive graphs, monitors custom budget caps, and uses AI analytics to answer financial queries.
          </p>

          {/* Action buttons (Conditioned on login state) */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-500/20 hover:opacity-90 hover:scale-[1.01] transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-500/20 hover:bg-primary-500 hover:scale-[1.01] transition-all"
                >
                  Start your Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 sm:mt-28">
          
          {/* Feature 1 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4 hover:border-slate-800 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/10">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Financial Advisory</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate detailed analysis lists breaking down spending limits, saving opportunities, predicted expenses, and risk ratings.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4 hover:border-slate-800 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Utilize Recharts pie chart category splits and chronological line graphs to understand exact income vs expense flows.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4 hover:border-slate-800 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/10">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Chatbot</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask natural language questions about your custom transactions to extract statistics and savings advice instantly.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

// Mini inline SVG Sparkle Icon component
const SparkleIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default Home;
