import React from 'react';

const SkeletonCard = () => (
  <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow animate-pulse">
    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
    <div className="px-5 pb-5">
      <div className="h-6 mt-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 mt-2 bg-gray-300 rounded w-1/2"></div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="h-10 bg-gray-300 rounded-lg w-1/3"></div>
      </div>
    </div>
  </div>
);

const ResidencialSkeleton = () => {
  return (
    <div className="w-full">
      {/* Skeleton for Header/Search */}
      <div className="p-8">
        <div className="h-16 bg-gray-300 rounded w-1/2 mx-auto animate-pulse"></div>
        <div className="h-8 mt-4 bg-gray-300 rounded w-1/3 mx-auto animate-pulse"></div>
      </div>

      {/* Skeleton for Property Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default ResidencialSkeleton;
