import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBoards, deleteBoard } from '../services/api';
import { errorToast, successToast } from '../utils/toast';
import CreateBoardModal from '../components/common/CreateBoardModal';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';
import BoardSkeleton from '../components/common/BoardSkeleton';

export default function BoardsPage({ isSidebarCollapsed }) {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [getNew, setGetNew] = useState('')
    const [boardToDelete, setBoardToDelete] = useState(null);

    useEffect(() => {
        const fetchBoards = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedBoards = await getBoards();
                setBoards(fetchedBoards);
            } catch (err) {
                console.error('Failed to load boards:', err);
                setError(err.message || 'Could not load your boards');
                errorToast('Failed to load boards');
            } finally {
                setLoading(false);
            }
        };

        fetchBoards();
    }, [getNew]);


    // Create board handler (called from modal)
    const handleCreateBoard = (newBoard) => {
        setBoards(prev => [...prev, newBoard]);
        successToast('Board created successfully!');
        setShowCreateModal(false);
        setGetNew(true)
    };



    const handleDeleteBoard = async () => {
        if (!boardToDelete) return;

        try {
            await deleteBoard(boardToDelete.id);
            setBoards(prev => prev.filter(b => b._id !== boardToDelete.id));
            successToast('Board deleted successfully');
        } catch (err) {
            errorToast(err.message || 'Failed to delete board');
        } finally {
            setBoardToDelete(null);
        }
    };


    return (
        <>
            <main className={`max-w-7xl mx-auto px-6 py-12 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] ${isSidebarCollapsed ? 'md:ml-50' : ''}`}>
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-4xl font-bold text-gradient">
                        Your Boards
                    </h2>

                    <button
                        className="flex items-center justify-center gap-2 px-6 py-3
                                  bg-gradient-to-r from-primary-600 to-indigo-600 
                                  rounded-xl transition-all shadow-lg
                                   shadow-primary-500/30 hover:shadow-primary-500/50 text-white"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Create Board
                    </button>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <BoardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center py-12 text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {boards.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                                No boards yet. Create your first one!
                            </p>
                        ) : (
                            boards.map((board, index) => (
                                <div key={board._id} >

                                    <motion.div

                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                                        className="glass glass-hover h-80 rounded-3xl overflow-hidden cursor-pointer relative"
                                    >
                                        <Link
                                            to={`/board/${board._id}`}
                                            className="block absolute inset-0"
                                        >
                                            {/* Hover gradient overlay */}
                                            <div key="create-key" className="absolute inset-0 bg-gradient-to-br from-primary-500/5 dark:from-primary-500/10 via-purple-500/3 dark:via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                                            <div className={`relative h-full p-8 flex flex-col z-20 `} style={{ backgroundColor: board.backgroundColor }}>
                                                <h2 className="text-3xl font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors mb-4 line-clamp-2 opacity-100">
                                                    {board.title}
                                                </h2>

                                                <p className="text-surface-700 dark:text-gray-300 mb-8 line-clamp-3 flex-1 opacity-100 ">
                                                    {board.description || 'No description'}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between text-sm text-surface-600 dark:text-gray-400 opacity-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400" />
                                                        <span>Active</span>
                                                    </div>
                                                    <span>Updated recently</span>

                                                </div>
                                            </div>
                                        </Link>

                                    </motion.div>

                                    <div className="flex items-center">
                                        {/* Delete button - appears on hover */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setBoardToDelete({ id: board._id, title: board.title });
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 opacity-70 hover:opacity-100 transition-opacity"
                                            title="Delete board"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                </div>
                            ))
                        )}

                        {/* Add new board placeholder */}
                        <motion.div
                            key="create-placeholder"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => setShowCreateModal(true)}
                            className="glass h-80 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer group"
                        >
                            <Plus size={64} className="mb-6 group-hover:text-primary-400 transition-colors" />
                            <p className="text-xl font-medium">Create new board</p>
                        </motion.div>
                    </div>
                )}
            </main>

            {/* Create Board Modal */}
            <CreateBoardModal

                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateBoard}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={!!boardToDelete}
                onClose={() => setBoardToDelete(null)}
                onConfirm={handleDeleteBoard}
                title={boardToDelete?.title}
                deleteItem="Delete Board"
            />
        </>
    );
}