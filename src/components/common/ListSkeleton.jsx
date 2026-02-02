import React from 'react';
import Skeleton from './Skeleton';

const ListSkeleton = () => {
    return (
        <div className="min-w-[280px] sm:min-w-[300px] lg:min-w-[310px] glass p-4 rounded-2xl border border-surface-200/50 dark:border-surface-800/50 h-fit">
            {/* List Header */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton width="60%" height="1.5rem" className="rounded-lg" />
                <Skeleton width="24px" height="24px" className="rounded-lg" />
            </div>

            {/* Mock cards */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/50 dark:bg-surface-900/30 p-4 rounded-xl border border-surface-200/30 dark:border-surface-700/30 space-y-3">
                        <Skeleton height="1.25rem" width="85%" />
                        <div className="flex gap-2">
                            <Skeleton width="40px" height="18px" className="rounded-full" />
                            <Skeleton width="60px" height="18px" className="rounded-full" />
                        </div>
                        <div className="flex justify-between pt-1">
                            <Skeleton width="30px" height="12px" />
                            <Skeleton width="30px" height="12px" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add card placeholder */}
            <Skeleton height="2.5rem" className="mt-4 rounded-xl" />
        </div>
    );
};

export default ListSkeleton;
