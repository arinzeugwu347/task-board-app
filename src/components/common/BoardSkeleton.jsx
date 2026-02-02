import React from 'react';
import Skeleton from './Skeleton';

const BoardSkeleton = () => {
    return (
        <div className="glass h-80 rounded-3xl overflow-hidden p-8 flex flex-col relative">
            {/* Title */}
            <Skeleton height="2.5rem" width="70%" className="mb-4" />

            {/* Description lines */}
            <Skeleton height="1rem" width="90%" className="mb-2" />
            <Skeleton height="1rem" width="85%" className="mb-2" />
            <Skeleton height="1rem" width="40%" className="mb-8" />

            {/* Bottom info */}
            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width="12px" height="12px" />
                    <Skeleton width="40px" height="12px" />
                </div>
                <Skeleton width="100px" height="12px" />
            </div>
        </div>
    );
};

export default BoardSkeleton;
