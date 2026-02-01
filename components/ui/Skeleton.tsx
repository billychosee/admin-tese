'use client';

import React from 'react';
import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'skeleton-text',
    circular: 'skeleton-avatar rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{
        width: width,
        height: height || (variant === 'text' ? 16 : undefined),
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton width="100%" height={16} />
      <Skeleton width="80%" height={16} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton width={100} height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton width={colIndex === 0 ? 120 : 80} height={16} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 space-y-3">
          <Skeleton width={120} height={14} />
          <Skeleton width="80%" height={28} />
          <Skeleton width={100} height={12} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton width={150} height={20} />
        <Skeleton width={100} height={14} />
      </div>
      <Skeleton width="100%" height={250} />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={16} />
              <Skeleton width="60%" height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
