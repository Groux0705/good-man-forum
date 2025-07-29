import React from 'react';
import { LevelInfo } from '../../types';

interface LevelProgressProps {
  level: number;
  levelInfo: LevelInfo;
  className?: string;
  showDetails?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ 
  level, 
  levelInfo, 
  className = '',
  showDetails = true 
}) => {
  const progressPercentage = Math.min(levelInfo.progress, 100);
  const isMaxLevel = levelInfo.nextLevelExp === null;

  return (
    <div className={`${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{levelInfo.badge}</span>
            <span className="font-semibold text-foreground">
              Lv.{level}
            </span>
            <span className="text-sm text-muted-foreground">
              {levelInfo.title}
            </span>
          </div>
          {!isMaxLevel && (
            <span className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          )}
        </div>
      )}
      
      {!isMaxLevel ? (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      ) : (
        <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full h-2">
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse" />
        </div>
      )}
      
      {showDetails && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{levelInfo.currentLevelExp.toLocaleString()} EXP</span>
          {isMaxLevel ? (
            <span className="text-yellow-600 font-medium">MAX</span>
          ) : (
            <span>{levelInfo.nextLevelExp?.toLocaleString()} EXP</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelProgress;