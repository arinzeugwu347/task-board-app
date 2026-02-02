import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email.trim());
            setSubmitted(true);
            toast.success('Reset link sent to terminal!');
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 px-4">
                <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 text-center text-white">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Check your terminal!</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Since this is a demo, we've logged the reset link to your backend server terminal.
                        Copy the link from there to reset your password.
                    </p>
                    <Link to="/login" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                        <ArrowLeft size={16} className="mr-2" /> Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 px-4">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50">
                <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back to login
                </Link>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Forgot password?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Don't worry, happens to the best of us. Enter your email and we'll send you a link to reset it.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 text-white">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                required
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
