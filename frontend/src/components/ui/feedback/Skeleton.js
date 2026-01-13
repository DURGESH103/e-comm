import React from 'react';

const Skeleton = ({ 
  variant = 'rectangular', 
  width = 'w-full', 
  height = 'h-4',
  className = '',
  ...props 
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded-xl';
  
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md'
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${width} ${height} ${className}`}
      {...props}
    />
  );
};

// Skeleton compositions for common use cases
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
    <Skeleton variant="rectangular" height="h-48" />
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-3" width="w-1/2" />
      <Skeleton height="h-6" width="w-1/3" />
    </div>
  </div>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton variant="circular" width="w-12" height="h-12" />
    <div className="flex-1 space-y-2">
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-3" width="w-1/2" />
    </div>
  </div>
);

export default Skeleton;