// src/components/SkeletonCard.jsx
import React from 'react';

const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card w-full mb-4 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-24 h-16 bg-white/5 rounded-xl"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-white/5 rounded-full w-3/4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-white/5 rounded-full"></div>
                <div className="h-4 bg-white/5 rounded-full"></div>
                <div className="h-4 bg-white/5 rounded-full w-2/3"></div>
              </div>
            </div>
            <div className="w-full md:w-32 h-12 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
