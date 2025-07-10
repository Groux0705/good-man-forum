import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const getDotsSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-1 h-1';
      case 'md': return 'w-2 h-2';
      case 'lg': return 'w-3 h-3';
      default: return 'w-2 h-2';
    }
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        <div className={`${getDotsSizeClasses()} bg-primary rounded-full animate-loading-dots`} style={{ animationDelay: '-0.32s' }} />
        <div className={`${getDotsSizeClasses()} bg-primary rounded-full animate-loading-dots`} style={{ animationDelay: '-0.16s' }} />
        <div className={`${getDotsSizeClasses()} bg-primary rounded-full animate-loading-dots`} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${getSizeClasses()} bg-primary rounded-full animate-pulse-soft ${className}`} />
    );
  }

  return (
    <Loader2 className={`${getSizeClasses()} animate-spin text-primary ${className}`} />
  );
};

export default LoadingSpinner;