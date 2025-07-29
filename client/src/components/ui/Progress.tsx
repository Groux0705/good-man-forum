import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showValue?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className = '', 
  showValue = false 
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      >
        {showValue && (
          <div className="flex items-center justify-center h-full text-xs text-primary-foreground font-medium">
            {Math.round(clampedValue)}%
          </div>
        )}
      </div>
    </div>
  );
};