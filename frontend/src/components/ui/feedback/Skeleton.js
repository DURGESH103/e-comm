import React from 'react';

const Shimmer = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <Shimmer className="h-52 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Shimmer className="h-3 w-1/3" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-4/5" />
      <div className="flex items-center gap-2 pt-1">
        <Shimmer className="h-5 w-1/3" />
        <Shimmer className="h-4 w-1/4" />
      </div>
      <Shimmer className="h-9 w-full mt-2" />
    </div>
  </div>
);

export const SliderCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-44 sm:w-52 flex-shrink-0">
    <Shimmer className="h-44 w-full rounded-none" />
    <div className="p-3 space-y-2">
      <Shimmer className="h-3 w-1/3" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-5 w-1/2" />
    </div>
  </div>
);

export const BannerSkeleton = () => (
  <Shimmer className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl" />
);

export const ListItemSkeleton = () => (
  <div className="flex items-center space-x-4 p-4">
    <Shimmer className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  </div>
);

const Skeleton = ({ variant = 'rectangular', width = 'w-full', height = 'h-4', className = '' }) => (
  <Shimmer className={`${variant === 'circular' ? 'rounded-full' : 'rounded-xl'} ${width} ${height} ${className}`} />
);

export default Skeleton;
