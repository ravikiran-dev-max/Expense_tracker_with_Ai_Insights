import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, User } from 'lucide-react';

/**
 * Sidebar Navigation drawer component
 * Renders NavLinks that automatically style active links and provides mobile overlay backdrop controls.
 */
const Sidebar = ({ isOpen, onClose }) => {
  // Navigation items mapping
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay (click outside menu closes it) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar side-panel */}
      <aside
        className={`fixed bottom-0 top-16 z-35 flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={onClose} // Auto-close drawer on mobile when link is clicked
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/20 to-indigo-500/10 text-primary-400 border border-primary-500/20 shadow-md shadow-primary-500/5'
                          : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </NavLink>
                </li>
              );
            })}
            
          </ul>
        </div>

        {/* Sidebar branding footer panel */}
        <div className="border-t border-slate-900 p-4 text-center">
          <p className="text-[10px] text-slate-500">Expense Tracker</p>
          <p className="text-[9px] text-slate-600 mt-0.5">Manage your expenses here (Stable)</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
