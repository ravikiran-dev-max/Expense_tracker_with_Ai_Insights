import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Bell, Menu, X, LogOut, Settings, CreditCard, Zap, ShieldCheck } from 'lucide-react';

/**
 * Navbar Component: Global Header panel.
 * Contains user settings profile navigation, logo branding, and live system alert notifications.
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout, apiCall } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);         // Inbox array
  const [showNotifications, setShowNotifications] = useState(false); // Controls notifications popup
  const [showProfileMenu, setShowProfileMenu] = useState(false);     // Controls user options popup

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /**
   * Action: Fetch alerts and notifications from the backend database
   */
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiCall('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  // Run poll cycle: Fetch on mount, and schedule recurring fetch triggers every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener: Automatically closes dropdown bubbles on outer clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Action: Mark notification as read by ID
   */
  const handleMarkAsRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
      // Update local state directly to skip refetch overhead
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err.message);
    }
  };

  /**
   * Action: Mark all notifications read in bulk
   */
  const handleMarkAllRead = async () => {
    try {
      await apiCall('/notifications/read-all', { method: 'PUT' });
      // Update local state directly
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all read:', err.message);
    }
  };

  // Count unread messages to display counts and ping indicators
  const unreadCount = notifications.filter((n) => !n.read).length;

  /**
   * Helper: Resolves user avatar source. Handles local uploads, Cloudinary links, and Dicebear SVG icons.
   */
  const getAvatarSrc = () => {
    if (!user?.avatar) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}`;
    }
    // Return directly if it is a Cloudinary secure link
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    // Compute dynamic host (API_BASE minus the trailing "/api")
    const host = API_BASE.replace('/api', '');
    return `${host}${user.avatar}`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Mobile Menu Burger Trigger */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onMenuToggle}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
                aria-label="Toggle Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-400 text-white shadow-lg shadow-primary-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              {/* Dynamic Branding Text (stable release indicator) */}
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                24eg105p04`s`
              </span>
            </Link>
          </div>

          {/* Action Navigation Panels */}
          <div className="flex items-center gap-4">
            {!user ? (
              // Guest layout options
              location.pathname !== '/login' && location.pathname !== '/signup' && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-500 transition"
                  >
                    Sign up
                  </Link>
                </div>
              )
            ) : (
              // Authenticated user controls
              <div className="flex items-center gap-3">
                
                {/* Notifications Toaster Menu Trigger */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false); // Close profile dropdown
                    }}
                    className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
                  >
                    <Bell className="h-5 w-5" />
                    {/* Ping animating circle indicating unread messages */}
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications List Bubble */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl animate-fade-in z-50">
                      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                        <span className="text-xs font-semibold text-slate-400">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-medium text-primary-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      {/* Notifications Container viewport */}
                      <div className="max-h-64 overflow-y-auto mt-1 flex flex-col gap-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                              className={`flex flex-col rounded-lg p-2.5 text-left text-xs transition cursor-pointer ${
                                notif.read
                                  ? 'bg-transparent hover:bg-slate-850/50 text-slate-400'
                                  : 'bg-slate-850 text-white font-medium hover:bg-slate-800'
                              }`}
                            >
                              <span>{notif.message}</span>
                              <span className="mt-1 text-[10px] text-slate-500">
                                {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile menu dropdown selection */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false); // Close notifications dropdown
                    }}
                    className="flex items-center gap-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 transition focus:outline-none"
                  >
                    <img
                      src={getAvatarSrc()}
                      alt={user.username}
                      className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800 object-cover"
                    />
                    <span className="hidden text-sm font-medium text-slate-300 md:block max-w-[100px] truncate">
                      {user.username}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl animate-fade-in z-50">
                      <div className="border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
                        Logged in as <p className="font-semibold text-slate-200 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-white transition"
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                            navigate('/');
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
