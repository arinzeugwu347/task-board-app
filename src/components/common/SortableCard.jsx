import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';

export default function SortableCard({ card, onDetail, onDelete, onEdit }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent triggering card click (edit)
        // Pass ID and Title to parent for the custom Modal
        onDelete(card._id || card.id, card.title);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(card);
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            // In SortableCard.jsx – replace onClick
            onClick={() => onDetail(card)}       // ← NOW USED – opens edit modal
            className={`
                p-5 rounded-xl bg-slate-200 dark:bg-gray-900
                border border-gray-200/80 dark:border-gray-800/70
                shadow-sm hover:shadow-md hover:border-indigo-400/50 cursor-pointer group relative
                transition-all duration-200
                ${isDragging ? 'opacity-40 scale-95 shadow-xl' : ''}
            `}
        >
            <div className="flex justify-between items-start gap-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex-1 line-clamp-2">
                    {card.title}
                </h4>

                {/* Delete button – appears on hover */}
                <button
                    onClick={handleDeleteClick}
                    className="
                        opacity-0 group-hover:opacity-100 
                        transition-opacity p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40
                        text-red-600 dark:text-red-400
                    "
                    title="Delete card"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {card.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {card.description}
                </p>
            )}
        </div>
    );
}