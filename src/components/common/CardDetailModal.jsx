import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, User, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { updateCard, addComment, deleteComment } from '../../services/api';
import { successToast, errorToast } from '../../utils/toast';

const labelOptions = [
    { value: 'bug', label: 'Bug', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' },
    { value: 'feature', label: 'Feature', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' },
    { value: 'design', label: 'Design', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
];

export default function CardDetailModal({ isOpen, onClose, card, onSave, refetch }) {
    const [editedCard, setEditedCard] = useState({
        title: '',
        description: '',
        dueDate: '',
        labels: [],
    });
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (card && isOpen) {
            setEditedCard({
                title: card.title || '',
                description: card.description || '',
                dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
                labels: card.labels || [],
            });
            setComments(card.comments || []);
        }
    }, [card, isOpen]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [editedCard.description]);

    if (!isOpen || !card) return null;

    const handleSave = async () => {
        if (!editedCard.title.trim()) {
            errorToast('Title is required');
            return;
        }

        setLoading(true);

        try {
            // Build FLAT payload — no spread, no nesting risk
            const payload = {
                ...editedCard,
                title: editedCard.title.trim(),
                description: editedCard.description.trim(),
                dueDate: editedCard.dueDate || null,
                labels: editedCard.labels || [],
            };

            const savedCard = await updateCard(card._id || card.id, payload);

            successToast('Card updated successfully!');
            onSave(savedCard);
            refetch?.();
            onClose();
        } catch (err) {
            errorToast(err.response?.data?.message || err.message || 'Failed to update card');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        const trimmed = newComment.trim();
        if (!trimmed) {
            errorToast('Comment cannot be empty');
            return;
        }

        setCommentLoading(true);

        try {
            const updatedCard = await addComment(card._id, trimmed);
            setComments(updatedCard.comments || []);
            setNewComment('');
            successToast('Comment added!');
            refetch?.();
        } catch (err) {
            console.error('Comment error:', err);
            errorToast(err.message || 'Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const addLabel = (value) => {
        if (!editedCard.labels.includes(value)) {
            setEditedCard({ ...editedCard, labels: [...editedCard.labels, value] });
        }
    };

    const removeLabel = (value) => {
        setEditedCard({
            ...editedCard,
            labels: editedCard.labels.filter((l) => l !== value),
        });
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(card._id, commentId);
            setComments(comments.filter((c) => c._id !== commentId));
            successToast('Comment deleted successfully!');
            refetch?.();
        } catch (err) {
            errorToast(err.response?.data?.message || err.message || 'Failed to delete comment');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
            onClick={onClose}
        >
            <div
                className="
          relative w-full max-w-5xl h-[90vh] overflow-hidden
          bg-gradient-to-br from-gray-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-950/95
          rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-800/40
          flex flex-col md:flex-row
        "
                onClick={e => e.stopPropagation()}
            >
                {/* Main content – left side (title + description + comments) */}
                <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10">

                    {/* Title */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <textarea
                        ref={textareaRef}
                        value={editedCard.title ?? ''}
                        onChange={e => setEditedCard({ ...editedCard, title: e.target.value })}
                        placeholder="Card title"
                        className="
              w-full min-h-[120px] bg-transparent border border-gray-300/50 dark:border-gray-700/50
              rounded-lg p-4 text-gray-800 dark:text-gray-200 resize-none
              focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
              font-medium leading-relaxed mb-6
            "
                        disabled={loading}
                    />

                    {/* Description */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        ref={textareaRef}
                        value={editedCard.description ?? ''}
                        onChange={e => setEditedCard({ ...editedCard, description: e.target.value })}
                        placeholder="Add a more detailed description..."
                        className="
              w-full min-h-[120px] bg-transparent border border-gray-300/50 dark:border-gray-700/50
              rounded-lg p-4 text-gray-800 dark:text-gray-200 resize-none
              focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
              font-medium leading-relaxed
            "
                        disabled={loading}
                    />

                    {/* Comments */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-8">
                        Comments ({comments.length})
                    </label>
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                        {comments.map((comment) => (
                            <div key={comment._id || comment.id} className="glass p-4 rounded-xl group ">
                                <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-800 dark:text-gray-300">
                                    {comment.text}
                                </p>
                                <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="
                                        opacity-0 group-hover:opacity-100 
                                        transition-opacity p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40
                                        text-red-600 dark:text-red-400
                                    "
                                        title="Delete comment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {comment.user?.username || 'You'} • {new Date(comment.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Add comment */}
                    <div className="flex gap-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-3 bg-transparent border border-gray-300/50 dark:border-gray-700/50 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                            disabled={commentLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                        />
                        <button
                            onClick={handleAddComment}
                            className="px-4 py-3 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            disabled={commentLoading}
                        >
                            {commentLoading ? 'Sending...' : <Plus size={18} />}
                        </button>
                    </div>
                </div>

                {/* Sidebar – metadata */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200/50 dark:border-gray-800/50 bg-gray-50/80 dark:bg-gray-950/50 p-6 md:p-8 flex flex-col gap-8 overflow-y-auto">
                    {/* Due Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar size={16} />
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={editedCard.dueDate ?? ''}
                            onChange={e => setEditedCard({ ...editedCard, dueDate: e.target.value })}
                            className="
                w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              "
                            disabled={loading}
                        />
                    </div>

                    {/* Labels */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Tag size={16} />
                            Labels
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {editedCard.labels.map((l) => (
                                <span
                                    key={l}
                                    className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1"
                                >
                                    {l}
                                    <Trash2
                                        size={12}
                                        className="cursor-pointer opacity-70 hover:opacity-100"
                                        onClick={() => removeLabel(l)}
                                    />
                                </span>
                            ))}
                        </div>

                        {/* Add label buttons */}
                        <div className="flex flex-wrap gap-2">
                            {labelOptions.map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    onClick={() => addLabel(value)}
                                    className={`px-3 py-1 text-xs rounded-full border ${color} hover:opacity-80 transition-opacity disabled:opacity-50`}
                                    disabled={editedCard.labels.includes(value)}
                                >
                                    + {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-800/50 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            className={`px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    disabled={loading}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}