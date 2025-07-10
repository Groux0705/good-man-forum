import React from 'react';
import { Card, CardContent } from './Card';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => {
  return (
    <div 
      className={`skeleton rounded-md ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
};

interface CourseCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({ 
  viewMode = 'grid' 
}) => {
  if (viewMode === 'list') {
    return (
      <Card className="skeleton-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <Skeleton className="w-48 h-28 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="skeleton-card animate-fade-in">
      <CardContent className="p-0">
        <Skeleton className="aspect-video rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CourseDetailSkeletonProps {}

export const CourseDetailSkeleton: React.FC<CourseDetailSkeletonProps> = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="skeleton-card">
              <CardContent className="p-0">
                <Skeleton className="aspect-video rounded-lg" />
              </CardContent>
            </Card>
            
            <Card className="skeleton-card">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="skeleton-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            
            <Card className="skeleton-card">
              <CardContent className="p-6">
                <Skeleton className="h-5 w-16 mb-4" />
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;