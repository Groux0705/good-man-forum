import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';

interface PointDisplayProps {
  balance: number;
  experience?: number;
  size?: 'sm' | 'md' | 'lg';
  showExperience?: boolean;
  className?: string;
}

const PointDisplay: React.FC<PointDisplayProps> = ({ 
  balance, 
  experience, 
  size = 'md',
  showExperience = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 积分显示 */}
      <div className="flex items-center space-x-1">
        <Coins className={`${iconSizes[size]} text-yellow-500`} />
        <span className={`${sizeClasses[size]} font-medium text-foreground`}>
          {balance.toLocaleString()}
        </span>
      </div>
      
      {/* 经验值显示 */}
      {showExperience && experience !== undefined && (
        <div className="flex items-center space-x-1">
          <TrendingUp className={`${iconSizes[size]} text-blue-500`} />
          <span className={`${sizeClasses[size]} font-medium text-foreground`}>
            {experience.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PointDisplay;