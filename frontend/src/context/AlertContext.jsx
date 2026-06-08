import React, { createContext, useState, useContext, useCallback } from 'react';

// Create context for Toast Alerts
const AlertContext = createContext();

/**
 * Hook to consume Alert context triggers safely
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

/**
 * Toast notifications manager context wrapper
 */
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]); // Array of active alert banner objects

  /**
   * Remove an alert from the toaster array by ID
   */
  const removeAlert = useCallback((id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }, []);

  /**
   * Trigger and display a Toast alert block
   * @param {string} message - Content message to show
   * @param {'info' | 'success' | 'error' | 'warning'} type - Visual theme of alert banner
   * @param {number} duration - Banner visible duration in milliseconds (defaults to 5s, 0 for infinite)
   */
  const showAlert = useCallback((message, type = 'info', duration = 5000) => {
    // Generate unique random string ID for alert tracking
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    // Add alert item to active queue
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, type, duration }]);

    // Set auto-dismiss timer if duration is positive
    if (duration) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, [removeAlert]);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
      
      {/* Toast Overlay Container: Absolute layout floating on top-right screen space */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

/**
 * Visual styling block representing a single Alert item card
 */
const AlertItem = ({ alert, onClose }) => {
  const { message, type } = alert;

  // Default theme classes
  let bgClass = 'bg-slate-900 border-slate-800 text-white';
  let iconColor = 'text-blue-400';
  let borderLeft = 'border-l-blue-500';

  // Apply colors depending on alert classification
  if (type === 'success') {
    bgClass = 'bg-slate-900 border-slate-800 text-white';
    iconColor = 'text-emerald-400';
    borderLeft = 'border-l-emerald-500';
  } else if (type === 'error') {
    bgClass = 'bg-slate-900 border-slate-800 text-white';
    iconColor = 'text-rose-400';
    borderLeft = 'border-l-rose-500';
  } else if (type === 'warning') {
    bgClass = 'bg-slate-900 border-slate-800 text-white';
    iconColor = 'text-amber-400';
    borderLeft = 'border-l-amber-500';
  }

  return (
    <div
      className={`flex items-start p-4 rounded-xl border border-l-4 shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 animate-slide-up ${bgClass} ${borderLeft}`}
      role="alert"
    >
      <div className="flex-1 mr-2 text-sm font-medium leading-5">
        <div className="flex items-center gap-2 mb-1">
          {/* Small accent dot matching the alert color code */}
          <span className={`w-2 h-2 rounded-full ${iconColor} bg-current`} />
          <span className="font-semibold capitalize text-xs tracking-wider text-slate-400">{type}</span>
        </div>
        {message}
      </div>
      
      {/* Dismiss Button */}
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors duration-150 focus:outline-none"
        aria-label="Close alert"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
