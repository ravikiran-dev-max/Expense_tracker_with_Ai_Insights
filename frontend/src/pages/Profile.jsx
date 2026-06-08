import React, { useState, useRef } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { User, Lock, Upload, Save, IndianRupee } from 'lucide-react';

/**
 * Profile Settings Page: Allows users to update account details, avatar photo, password, and monthly budgets.
 */
const Profile = () => {
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuth();
  const { showAlert } = useAlert();

  const fileInputRef = useRef(null); // DOM ref to hidden file input element

  // State: Profile username and monthly budget cap inputs
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    monthlyBudget: user?.monthlyBudget || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // State: Password credentials update inputs
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State: Avatar uploading loader
  const [avatarLoading, setAvatarLoading] = useState(false);

  /**
   * Action: Handles submission of profile updates (username & budget cap)
   */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.username.trim()) {
      showAlert('Username cannot be empty', 'error');
      return;
    }

    setProfileLoading(true);
    await updateProfile(
      profileData.username,
      profileData.monthlyBudget ? Number(profileData.monthlyBudget) : 0 // Set to 0 if clear
    );
    setProfileLoading(false);
  };

  /**
   * Action: Handles password alteration form checks & submit
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      showAlert('Please enter current and new passwords', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showAlert('New password must be at least 6 characters long', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    setPasswordLoading(true);
    const success = await updatePassword(passwordData.oldPassword, passwordData.newPassword);
    setPasswordLoading(false);

    if (success) {
      // Clear input fields on success
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  /**
   * Action: Validates and uploads file stream as avatar image
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reject files greater than 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      showAlert('File size must be less than 2MB', 'error');
      return;
    }
    // Reject non-image mime formats
    if (!file.type.startsWith('image/')) {
      showAlert('Please upload a valid image file', 'error');
      return;
    }

    // Wrap file inside multi-part FormData
    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    await uploadAvatar(formData);
    setAvatarLoading(false);
  };

  /**
   * Helper: Computes image src path dynamically to support local uploads, cloud buckets, and placeholder Dicebear avatars
   */
  const getAvatarSrc = () => {
    if (!user?.avatar) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}`;
    }
    // If it's a Cloudinary path or an absolute HTTP URL, return directly
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    // Otherwise compute local backend upload hostname
    const host = API_BASE.replace('/api', '');
    return `${host}${user.avatar}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Profile Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Customize your personal profile preferences, security settings, and budgets.</p>
      </div>

      {/* Grid: 2-Column Desktop layout panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Avatar Settings & User Profile Form) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Avatar Settings card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={getAvatarSrc()}
                alt="Profile Avatar"
                className="h-28 w-28 rounded-full border-2 border-slate-700 bg-slate-800 object-cover shadow-xl"
              />
              {avatarLoading && (
                <div className="absolute inset-0 rounded-full bg-slate-950/70 flex items-center justify-center">
                  <span className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-3">
              <h4 className="text-base font-bold text-white">Profile Avatar</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Upload a customized JPG, JPEG, or PNG profile image. Maximum file size is 2MB.
              </p>
              {/* Hidden file selector trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={avatarLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-955 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                <Upload className="h-3.5 w-3.5" />
                Choose New Image
              </button>
            </div>
          </div>

          {/* Card: Account Details form settings */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
              <User className="h-4.5 w-4.5 text-primary-400" />
              Account Settings
            </h4>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Username Input */}
                <div>
                  <label htmlFor="prof-username" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Username
                  </label>
                  <input
                    id="prof-username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition"
                  />
                </div>

                {/* Linked Email Address (Read-only for account consistency) */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Email Address (Linked)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-900 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>

              </div>

              {/* Budget Limit settings */}
              <div>
                <label htmlFor="prof-budget" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Monthly Expense Budget Cap (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <IndianRupee className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="prof-budget"
                    type="number"
                    placeholder="0.00 (Enter 0 to disable warnings)"
                    value={profileData.monthlyBudget}
                    onChange={(e) => setProfileData({ ...profileData, monthlyBudget: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 leading-normal">
                  Defining a budget limit automatically triggers alerts if monthly expenses cross 80% and 100% of this figure.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-500/10 transition"
                >
                  {profileLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Details
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right Column: Security/Password Changes card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 self-start">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
            <Lock className="h-4.5 w-4.5 text-indigo-400" />
            Security & Password
          </h4>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            {/* Current Password */}
            <div>
              <label htmlFor="prof-oldpass" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Current Password
              </label>
              <input
                id="prof-oldpass"
                type="password"
                placeholder="••••••"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-primary-500 transition"
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="prof-newpass" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                New Password
              </label>
              <input
                id="prof-newpass"
                type="password"
                placeholder="••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-primary-500 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="prof-confpass" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <input
                id="prof-confpass"
                type="password"
                placeholder="••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-primary-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-500/10 transition disabled:opacity-50"
            >
              {passwordLoading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
