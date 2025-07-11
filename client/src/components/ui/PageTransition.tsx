import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  delay = 0
}) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;