import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Lock, Camera } from 'lucide-react';
import { changePassword, getCurrentUser, changeProfilePicture } from '../services/api';
import { successToast, errorToast } from '../utils/toast';

export default function SettingsPage() {
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Change password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Avatar upload
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // Fetch user details from backend
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);

            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setError(err.message || 'Could not load user details');
                errorToast('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            errorToast('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            errorToast('New password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);

        try {
            await changePassword(currentPassword, newPassword);
            successToast('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            errorToast(err.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            errorToast('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            errorToast('Image size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await changeProfilePicture(formData);
            setUser(prev => ({ ...prev, profilePicture: response.user.profilePicture }));
            successToast('Profile picture updated');
        } catch (err) {
            console.error('Upload failed:', err);
            errorToast(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <main className={`max-w-4xl mx-auto px-6 py-12 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-all`}>
            <h2 className="text-4xl font-bold text-gradient mb-10">
                Settings
            </h2>

            {loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-12 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && user && (
                <div className="space-y-10">
                    {/* Profile Section */}
                    <section className="glass rounded-2xl p-8 shadow-lg border border-surface-200/30 dark:border-surface-800/30">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                            <div
                                className="relative group cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-2 border-indigo-500/50">
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user.name?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Camera size={24} className="text-white" />
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            <div>
                                <h3 className="text-2xl font-bold text-surface-900 dark:text-white">
                                    {user.name || 'User'}
                                </h3>
                                <p className="text-gray-400 dark:text-gray-300">{user.email}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={user.name || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-lg bg-surface-900/10 dark:bg-surface-800/20 border border-surface-200/50 dark:border-surface-700/50 text-surface-900 dark:text-surface-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact support to change name</p>
                        </div>
                    </section>

                    {/* Change Password */}
                    <section className="glass rounded-2xl p-8 shadow-lg border border-surface-200/30 dark:border-surface-800/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock size={24} className="text-indigo-400" />
                            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">
                                Change Password
                            </h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-surface-200/50 dark:border-surface-700/50 bg-surface-900/10 dark:bg-surface-800/20 text-surface-900 dark:text-surface-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-surface-200/50 dark:border-surface-700/50 bg-surface-900/10 dark:bg-surface-800/20 text-surface-900 dark:text-surface-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-surface-200/50 dark:border-surface-700/50 bg-surface-900/10 dark:bg-surface-800/20 text-surface-900 dark:text-surface-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${loading
                                        ? 'bg-indigo-400 cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                                        }`}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Account Actions */}
                    <section className="glass rounded-2xl p-8 shadow-lg border border-surface-200/30 dark:border-surface-800/30">
                        <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
                            Account
                        </h3>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-3 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all w-full sm:w-auto"
                        >
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}