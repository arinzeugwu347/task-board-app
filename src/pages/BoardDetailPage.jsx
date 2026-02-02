import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import SortableList from '../components/common/SortableList';
import SortableCard from '../components/common/SortableCard';
import Modal from '../components/common/Modal';
import EditCardModal from '../components/common/EditCardModal';
import CardDetailModal from '../components/common/CardDetailModal';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';
import EditListModal from '../components/common/EditListModal';
import { getLists, createList, deleteList, getCards, createCard, deleteCard, updateCard, reorderLists, reorderCards } from '../services/api';
import { errorToast, successToast } from '../utils/toast';
import ListSkeleton from '../components/common/ListSkeleton';

export default function BoardDetailPage() {
    const { boardId } = useParams();
    const [lists, setLists] = useState([]);
    const [activeId, setActiveId] = useState(null);


    // Modal & form state
    const [showAddListModal, setShowAddListModal] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [currentListIdForCard, setCurrentListIdForCard] = useState(null);
    const [listToDelete, setListToDelete] = useState(null);

    const [newListTitle, setNewListTitle] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDescription, setNewCardDescription] = useState('');

    const [editList, setEditList] = useState(null);

    const [editCard, setEditCard] = useState(null);
    const [detailCard, setDetailCard] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    // Delete card state
    const [cardToDelete, setCardToDelete] = useState(null);

    // Fetch real lists for this board
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const fetchedLists = await getLists(boardId);

                const listsWithCards = await Promise.all(
                    (fetchedLists || []).map(async (list) => {
                        try {
                            const cards = await getCards(list._id || list.id);
                            return { ...list, cards: cards || [] };
                        } catch (cardErr) {
                            console.warn(`Cards fetch failed for list ${list._id}:`, cardErr);
                            return { ...list, cards: [] };
                        }
                    })
                );

                setLists(listsWithCards || []);
            } catch (err) {
                console.error('Failed to fetch lists:', err);
                setError(err.message || 'Could not load board data');
                errorToast('Failed to load board data');
                setLists([]); // force empty array on error
            } finally {
                setLoading(false);
            }
        };

        if (boardId) {
            fetchData();
        }
    }, [boardId, refresh]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    function findContainer(id) {
        if (lists.some((l) => l._id === id)) return id;
        return lists.find((l) => l.cards.some((c) => c._id === id))?._id || null;
    }

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragOver(event) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Ignore if we are dragging a LIST
        if (lists.some(l => l._id === activeId)) {
            return;
        }

        // Find the containers
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setLists((prev) => {
            const activeItems = prev.find((l) => l._id === activeContainer)?.cards || [];
            const overItems = prev.find((l) => l._id === overContainer)?.cards || [];

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex((c) => c._id === activeId);
            const overIndex = overItems.findIndex((c) => c._id === overId);

            let newIndex;
            if (overIndex === -1) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return prev.map((l) => {
                if (l._id === activeContainer) {
                    return {
                        ...l,
                        cards: activeItems.filter((c) => c._id !== activeId),
                    };
                } else if (l._id === overContainer) {
                    return {
                        ...l,
                        cards: [
                            ...overItems.slice(0, newIndex),
                            activeItems[activeIndex],
                            ...overItems.slice(newIndex, overItems.length),
                        ],
                    };
                }
                return l;
            });
        });
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (!activeContainer || !overContainer) {
            setActiveId(null);
            return;
        }

        // Helper to perform updates
        const updateStateAndPersist = (newItems, isCardReorder = false, targetListId = null, targetCardIds = null) => {
            setLists(newItems);

            if (isCardReorder && targetListId && targetCardIds) {
                reorderCards(targetListId, targetCardIds)
                    .then(() => successToast('Cards reordered successfully'))
                    .catch(err => {
                        errorToast('Failed to save card order — reverted');
                        console.error(err);
                        setLists(lists); // Revert to original lists from closure
                    });
            } else {
                // List reorder
                const listIds = newItems.map(l => l._id);
                reorderLists(boardId, listIds)
                    .then(() => successToast('Lists reordered successfully'))
                    .catch(err => {
                        errorToast('Failed to save list order — reverted');
                        console.error(err);
                        setLists(lists); // Revert
                    });
            }
        };


        // List reordering
        if (activeContainer === active.id && overContainer === over.id) {
            const oldIndex = lists.findIndex((l) => l._id === active.id);
            const newIndex = lists.findIndex((l) => l._id === over.id);

            if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(lists, oldIndex, newIndex);
                updateStateAndPersist(newOrder, false);
            }
            setActiveId(null);
            return;
        }

        // Card reordering
        const activeList = lists.find(l => l._id === activeContainer);
        const overList = lists.find(l => l._id === overContainer);

        if (!activeList || !overList) {
            setActiveId(null);
            return;
        }

        // Processing card move
        if (activeContainer === overContainer) {
            const oldIndex = activeList.cards.findIndex((c) => c._id === active.id);
            const newIndex = activeList.cards.findIndex((c) => c._id === over.id);

            if (oldIndex !== newIndex) {
                const newCards = arrayMove(activeList.cards, oldIndex, newIndex);

                // Construct new state
                const newLists = lists.map(l => {
                    if (l._id === activeContainer) {
                        return { ...l, cards: newCards };
                    }
                    return l;
                });

                // Persist
                const cardIds = newCards.map(c => c._id);
                updateStateAndPersist(newLists, true, activeContainer, cardIds);
            }
        } else {
            // Fallback for cases where handleDragOver didn't move it yet (shouldn't happen with current setup)
            // or explicit cross-container handling if we disabled handleDragOver state updates
            const newItems = lists.map((list) => ({ ...list, cards: [...(list.cards || [])] }));
            const source = newItems.find(l => l._id === activeContainer);
            const target = newItems.find(l => l._id === overContainer);

            const cardIndex = source.cards.findIndex(c => c._id === active.id);
            if (cardIndex !== -1) {
                const [movedCard] = source.cards.splice(cardIndex, 1);

                let insertAt = target.cards.length;
                const overIndex = target.cards.findIndex(c => c._id === over.id);
                if (overIndex !== -1) {
                    // logic dependent on direction, but usually insertion at index is fine
                    insertAt = overIndex >= 0 ? overIndex : insertAt;
                }

                target.cards.splice(insertAt, 0, movedCard);

                const cardIds = target.cards.map(c => c._id);
                updateStateAndPersist(newItems, true, target._id, cardIds);
            }
        }

        setActiveId(null);
    }
    const activeCard = activeId
        ? lists.flatMap((l) => l.cards || []).find((c) => c && (c.id === activeId || c._id === activeId))
        : null;

    // ── Add List ───────────────────────────────────────────────
    const handleAddList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) {
            errorToast('List title is required');
            return;
        }

        try {
            // Call real API - assuming backend expects boardId + title + description
            const newList = await createList(boardId, newListTitle.trim(), newListDescription.trim());

            // Add the newly created list to state immediately
            setLists((prev) => [...prev, newList]);

            successToast('List created successfully!');
            setNewListTitle('');
            setNewListDescription('');
            setShowAddListModal(false);
            setRefresh(true);
        } catch (err) {
            console.error('Failed to create list:', err);
            errorToast(err.message || 'Failed to create list');
        }
    };


    // ── Edit List ───────────────────────────────────────────────
    // Handle edit list click (opens modal with pre-filled data)
    const handleEditList = (list) => {
        setEditList(list); // opens the edit modal with this list
    };

    const handleSaveList = (updatedList) => {
        setLists(prev =>
            prev.map(l =>
                l._id === updatedList._id ? { ...l, ...updatedList, cards: l.cards } : l
            )
        );
        successToast('List updated successfully!');
        setRefresh(true);
        setEditList(null);
    };


    // Delete List 

    // Handler for trash icon click
    const handleDeleteList = (listId, listTitle) => {
        setListToDelete({ id: listId, title: listTitle });
    };

    // Confirm delete
    const deleteListConfirmed = async () => {
        if (!listToDelete) return;

        try {
            await deleteList(listToDelete.id);
            setLists(prev => prev.filter(l => l._id !== listToDelete.id));
            successToast('List deleted successfully');
            setRefresh(true);
        } catch (err) {
            errorToast(err.message || 'Failed to delete list');
        } finally {
            setListToDelete(null);
        }
    };




    // ── Add Card ───────────────────────────────────────────────
    const openAddCardModal = (listId) => {
        setCurrentListIdForCard(listId);
        setNewCardTitle('');
        setNewCardDescription('');
        setShowAddCardModal(true);
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCardTitle.trim() || !currentListIdForCard) {
            errorToast('Card title is required');
            return;
        }

        try {
            const newCard = await createCard(currentListIdForCard, newCardTitle.trim(), newCardDescription.trim());

            setLists((prev) =>
                prev.map((list) =>
                    (list.id || list._id) === currentListIdForCard
                        ? { ...list, cards: [...(list.cards || []), newCard] }
                        : list
                )
            );

            successToast('Card created successfully!');
            setNewCardTitle('');
            setNewCardDescription('');
            setShowAddCardModal(false);
            setCurrentListIdForCard(null);
            setRefresh(true);
        } catch (err) {
            errorToast(err.message || 'Failed to create card');
        }
    };

    // ── Edit Card (now real backend call) ───────────────────────────────────────────────
    const handleEditCard = (card) => {
        setEditCard(card);
    };

    const handleSaveCard = async (updatedCard) => {
        try {
            const savedCard = await updateCard(updatedCard.id || updatedCard._id, {
                title: updatedCard.title,
                description: updatedCard.description
            });

            setLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    cards: list.cards.map((c) => (c.id === savedCard.id || c._id === savedCard._id ? savedCard : c)),
                }))
            );

            successToast('Card updated successfully!');
            setEditCard(null);
        } catch (err) {
            errorToast(err.message || 'Failed to update card');
        }
    };

    // ── Delete Card ───────────────────────────────────────────────
    const handleDeleteCard = (cardId, cardTitle) => {
        setCardToDelete({ id: cardId, title: cardTitle });
    };

    const confirmDeleteCard = async () => {
        if (!cardToDelete) return;

        try {
            await deleteCard(cardToDelete.id);
            setLists((prev) =>
                prev.map((list) =>
                    list.cards.some(c => c.id === cardToDelete.id || c._id === cardToDelete.id)
                        ? { ...list, cards: list.cards.filter(c => c.id !== cardToDelete.id && c._id !== cardToDelete.id) }
                        : list
                )
            );
            successToast('Card deleted successfully');
        } catch (err) {
            errorToast(err.message || 'Failed to delete card');
        } finally {
            setCardToDelete(null);
        }
    };



    const handleOpenDetail = (card) => {
        setDetailCard(card);
    };

    const handleSaveDetail = (updated) => {
        setLists((prev) =>
            prev.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c._id === updated._id ? updated : c)),
            }))
        );
        setDetailCard(null);
    };


    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors">
            {/* Header - sticky & responsive */}
            <header className="sticky top-0 z-10 bg-[hsl(var(--background))] backdrop-blur-md border-b border-surface-200/50 dark:border-surface-800/50">
                <div
                    key="add-new-list-placeholder"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Board {boardId.slice(0, 4)}...
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Project planning & tasks
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddListModal(true)}
                        className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        Add List
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div key="add-new-list-placeholder" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {loading && (
                    <div className="
                        grid grid-cols-1 
                        sm:grid-cols-2 
                        lg:grid-cols-3 
                        xl:grid-cols-4 
                        gap-4 sm:gap-6 lg:gap-8
                    ">
                        {[1, 2, 3, 4].map((i) => (
                            <ListSkeleton key={i} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-600 dark:text-red-400 text-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={lists.map((l) => l._id)} strategy={rectSortingStrategy}>
                            <div className="
                                grid grid-cols-1 
                                sm:grid-cols-2 
                                lg:grid-cols-3 
                                xl:grid-cols-4 
                                gap-4 sm:gap-6 lg:gap-8
                                pb-8 overflow-x-auto lg:overflow-x-visible
                            ">
                                {lists.map((list) => (
                                    <SortableList
                                        key={list._id}
                                        list={list}
                                        onAddCard={() => openAddCardModal(list._id)}
                                        onEditList={handleEditList}
                                        onDeleteList={handleDeleteList}
                                        isDragging={activeId === list._id}
                                        onEditCard={handleEditCard}
                                        onDeleteCard={handleDeleteCard}
                                        onDetail={handleOpenDetail}
                                    />
                                ))}

                                {/* Add new list placeholder */}
                                <div
                                    className="min-w-[280px] sm:min-w-[300px] md:min-w-[300px] lg:min-w-[310px] xl:min-w-[310px] flex items-start justify-center cursor-pointer"
                                    onClick={() => setShowAddListModal(true)}
                                >
                                    <div className="
                                        w-full h-[420px] sm:h-[480px] lg:h-[520px] rounded-2xl border-2 border-dashed 
                                        border-gray-400/40 dark:border-gray-600/40 
                                        flex flex-col items-center justify-center text-gray-500 dark:text-gray-400
                                        hover:border-indigo-500/60 hover:text-indigo-400 transition-all duration-300 group
                                    ">
                                        <Plus size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                                        <p className="text-lg font-medium">Add new list</p>
                                    </div>
                                </div>
                            </div>
                        </SortableContext>

                        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}>
                            {activeId && activeCard && (
                                <div className="opacity-90 scale-[1.04] shadow-2xl rotate-[2deg]">
                                    <SortableCard card={activeCard} isOverlay />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* Add List Modal */}
            <Modal
                isOpen={showAddListModal}
                onClose={() => setShowAddListModal(false)}
                title="Create New List"
            >
                <form onSubmit={handleAddList} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            List Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="e.g. Backlog, Ideas, Blocked"
                            className="
                                w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                            "
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            value={newListDescription}
                            onChange={(e) => setNewListDescription(e.target.value)}
                            placeholder="Short note about what belongs here..."
                            rows={3}
                            className="
                                w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                            "
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddListModal(false)}
                            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Create List
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Card Modal */}
            <Modal
                isOpen={showAddCardModal}
                onClose={() => setShowAddCardModal(false)}
                title="Add New Card"
            >
                <form onSubmit={handleAddCard} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Card Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            placeholder="e.g. Implement user login flow"
                            className="
                                w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                            "
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            value={newCardDescription}
                            onChange={(e) => setNewCardDescription(e.target.value)}
                            placeholder="Details, notes, acceptance criteria..."
                            rows={4}
                            className="
                                w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                            "
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddCardModal(false)}
                            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Add Card
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Card Modal */}
            <EditCardModal
                isOpen={!!editCard}
                onClose={() => setEditCard(null)}
                card={editCard}
                onSave={handleSaveCard}

            />

            {/* Card Detail Modal */}
            <CardDetailModal
                isOpen={!!detailCard}
                onClose={() => setDetailCard(null)}
                card={detailCard}
                onSave={handleSaveDetail}
                onDelete={(id) => {
                    handleDeleteCard(id);
                    setDetailCard(null);
                }}
                refetch={() => setRefresh(true)}

            />

            {/* Delete List Modal */}
            <ConfirmDeleteModal
                isOpen={!!listToDelete}
                onClose={() => setListToDelete(null)}
                onConfirm={deleteListConfirmed}
                title={listToDelete?.title || ''}
                deleteItem="Delete List"
            />

            {/* Edit List Modal */}
            <EditListModal
                isOpen={!!editList}
                onClose={() => setEditList(null)}
                list={editList}
                onSave={handleSaveList}  // ← this line must point to the handler above
            />

            {/* Delete Card Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={!!cardToDelete}
                onClose={() => setCardToDelete(null)}
                onConfirm={confirmDeleteCard}
                title={cardToDelete?.title || ''}
                deleteItem="Delete Card"
            />

        </div>
    );
}
