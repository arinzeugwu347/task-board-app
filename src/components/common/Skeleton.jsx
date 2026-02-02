import React from 'react';

const Skeleton = ({ className, width, height, variant = 'rect' }) => {
    const style = {
        width: width || '100%',
        height: height || '1rem',
    };

    const variantClasses = {
        rect: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded-sm',
    };

    return (
        <div
            className={`skeleton shimmer-wrapper ${variantClasses[variant]} ${className || ''}`}
            style={style}
        />
    );
};

export default Skeleton;
