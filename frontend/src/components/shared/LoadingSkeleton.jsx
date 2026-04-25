import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-slate-200 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-20 bg-slate-100 rounded"></div>
            <div className="h-6 w-full bg-slate-200 rounded"></div>
            <div className="h-10 w-full bg-slate-100 rounded-xl mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
