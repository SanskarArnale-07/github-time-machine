"use client";
import React from 'react';

export function ProfileSkeleton() {
  return (
    <div className="bg-ink-surface border border-ink-border rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 w-full shadow-sm">
      <div className="w-24 h-24 rounded-full skeleton flex-shrink-0"></div>
      <div className="flex-grow space-y-4 w-full">
        <div className="space-y-2 flex flex-col items-center md:items-start">
          <div className="h-8 w-48 skeleton rounded-md"></div>
          <div className="h-4 w-32 skeleton rounded-md"></div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-3 w-full max-w-md skeleton rounded-md"></div>
          <div className="h-3 w-3/4 max-w-sm skeleton rounded-md"></div>
        </div>
        <div className="flex gap-4 pt-4 justify-center md:justify-start">
          <div className="h-4 w-24 skeleton rounded-md"></div>
          <div className="h-4 w-24 skeleton rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

export function RepoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-ink-surface border border-ink-border rounded-xl p-5 h-40 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 w-3/4 skeleton rounded-md"></div>
            <div className="h-3 w-full skeleton rounded-md"></div>
            <div className="h-3 w-5/6 skeleton rounded-md"></div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2">
            <div className="h-4 w-16 skeleton rounded-md"></div>
            <div className="h-4 w-12 skeleton rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-8 w-full">
      <div className="h-8 w-48 skeleton rounded-md mb-8"></div>
      <div className="border-l border-ink-border ml-6 pl-10 space-y-12 relative">
        {[1, 2].map(year => (
          <div key={year} className="relative">
            <div className="absolute -left-[59px] top-0 w-10 h-10 rounded-full skeleton"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-8 w-24 skeleton rounded-md"></div>
              <div className="h-6 w-20 skeleton rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              <div className="h-6 w-32 skeleton rounded-md"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(commit => (
                  <div key={commit} className="bg-ink-surface border border-ink-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <div className="h-5 w-20 skeleton rounded-md"></div>
                        <div className="h-5 w-16 skeleton rounded-md"></div>
                      </div>
                      <div className="h-4 w-24 skeleton rounded-md"></div>
                    </div>
                    <div className="h-4 w-3/4 skeleton rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
