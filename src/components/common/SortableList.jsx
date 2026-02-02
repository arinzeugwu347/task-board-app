import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Pen } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCard from './SortableCard';


export default function SortableList({ list, onAddCard, onDeleteList, onEditList, onEditCard, onDeleteCard, onDetail, isDragging = false, isOverlay = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: list._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        w-full max-w-[380px] mx-auto sm:mx-0 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]
        bg-white/60 dark:bg-gray-900/70 backdrop-blur-md
        border border-gray-200/60 dark:border-gray-800/60
        rounded-2xl shadow-xl overflow-hidden flex flex-col
        ${isDragging ? 'opacity-40 ring-2 ring-indigo-400/40 scale-[0.98]' : ''}
        ${isOverlay ? 'shadow-2xl ring-4 ring-indigo-500/60 opacity-95 scale-105' : ''}
      `}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/80 dark:bg-gray-950/50">

                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing outline-none"
                >
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white select-none">
                        {list.title}
                    </h3>
                    <div className="text-gray-400 dark:text-gray-500">
                        <GripVertical size={18} />
                    </div>
                </div>

                <div className="flex items-center gap-2 pl-2">

                    <button
                        onClick={() => onEditList(list)}
                        title="Edit List"
                        className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400"
                    >
                        <Pen size={18} />
                    </button>
                    <button
                        onClick={() => onDeleteList(list._id, list.title)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 opacity-70 hover:opacity-100 transition-opacity"
                        title="Delete list"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Cards area */}
            <div className="flex-1 p-4 space-y-4 min-h-[180px]">
                <SortableContext items={list.cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                    {list.cards.map((card) => (
                        <SortableCard
                            key={card._id}
                            card={card}
                            onEdit={onEditCard}
                            onDelete={(cardId, cardTitle) => onDeleteCard(cardId, cardTitle)}
                            onDetail={onDetail}
                        />
                    ))}
                </SortableContext>
            </div>

            {/* Add card button */}
            <button
                onClick={onAddCard}
                className="
                m-4 py-3 rounded-xl
                bg-gray-100/80 dark:bg-gray-800/60
                hover:bg-indigo-500/20 hover:text-indigo-400
                text-gray-600 dark:text-gray-400
                flex items-center justify-center gap-2 transition-colors
            ">
                <Plus size={18} />
                Add card
            </button>
        </div>
    );
}