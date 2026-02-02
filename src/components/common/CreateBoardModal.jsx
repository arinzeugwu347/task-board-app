import { useState } from 'react';
import { X } from 'lucide-react';
import { createBoard } from '../../services/api';

export default function CreateBoardModal({ isOpen, onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Board title is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const newBoard = await createBoard(title.trim(), description.trim(), backgroundColor.trim());
            onSuccess(newBoard);  // ← send the real board object to parent
            setTitle('');
            setDescription('');
            setBackgroundColor('');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create board');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Board
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Board Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Product Roadmap 2026"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                required
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="What is this board for? Add any details..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Background Color (optional)
                            </label>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: '', label: 'None', color: 'bg-gray-200 dark:bg-gray-700' },
                                    { value: 'red', label: 'Red', color: 'bg-red-500' },
                                    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                                    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
                                    { value: 'green', label: 'Green', color: 'bg-green-500' },
                                ].map((option) => (
                                    <label key={option.value} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="backgroundColor"
                                            value={option.value}
                                            checked={backgroundColor === option.value}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="sr-only"
                                            disabled={loading}
                                        />
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full 
                                                ${option.color} 
                                                border-2 border-transparent
                                                transition-all duration-200
                                                ${backgroundColor === option.value
                                                                                        ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                                                                                        : 'hover:scale-110 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                                                                                    }
                                                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                            title={option.label}
                                        />
                                        {option.value === '' && (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                                None
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors ${loading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {loading ? 'Creating...' : 'Create Board'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}