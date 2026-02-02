import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyTasks } from '../services/api'; // we'll add this next
import { errorToast } from '../utils/toast';
import CardDetailModal from '../components/common/CardDetailModal';
import Skeleton from '../components/common/Skeleton';

export default function MyTasksPage({ isSidebarCollapsed }) {
    const { user, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        const fetchMyTasks = async () => {
            // Wait for auth to finish loading before deciding if we have a user
            if (authLoading) return;

            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const myTasks = await getMyTasks();
                setTasks(myTasks || []);
            } catch (err) {
                console.error('Failed to fetch my tasks:', err);
                setError(err.message || 'Could not load your tasks');
                errorToast('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchMyTasks();
    }, [user, authLoading]);

    return (
        <main className={`max-w-7xl mx-auto px-6 py-12 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}>
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-bold text-gradient">
                    My Tasks
                </h2>
            </div>

            {loading && (
                <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass p-6 rounded-2xl space-y-4">
                            <Skeleton height="1.75rem" width="60%" />
                            <div className="space-y-2">
                                <Skeleton height="1rem" width="90%" />
                                <Skeleton height="1rem" width="40%" />
                            </div>
                            <div className="flex justify-between pt-2">
                                <div className="flex gap-2">
                                    <Skeleton width="50px" height="1.5rem" className="rounded-full" />
                                    <Skeleton width="70px" height="1.5rem" className="rounded-full" />
                                </div>
                                <Skeleton width="100px" height="1rem" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-8">
                    {tasks.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                            No tasks assigned to you yet.
                        </p>
                    ) : (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => setSelectedCard(task)}
                            >
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {task.title}
                                </h3>
                                <p className="text-gray-300 mb-4 line-clamp-2">
                                    {task.description || 'No description'}
                                </p>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        {task.labels?.map(label => (
                                            <span key={label} className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                                                {label}
                                            </span>
                                        ))}
                                        {task.dueDate && (
                                            <span className="flex items-center gap-1 text-yellow-400">
                                                <Calendar size={14} />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-gray-500">
                                        In list: {task.list?.title || 'Unknown'}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Card Detail Modal */}
            <CardDetailModal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                card={selectedCard}
                onSave={(updated) => {
                    // Optional: update task in list if needed
                    setSelectedCard(null);
                }}
                onDelete={(id) => {
                    // Optional: remove from tasks list
                    setSelectedCard(null);
                }}
            />
        </main>
    );
}