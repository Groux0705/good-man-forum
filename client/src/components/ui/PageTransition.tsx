import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsExiting(true);
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsExiting(false);
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, delay]);

  const transitionClasses = `
    transition-all duration-500 ease-out
    ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
    ${isExiting ? 'opacity-0 translate-y-2 scale-98' : ''}
  `;

  return (
    <div 
      className={`${transitionClasses} ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.320, 1)',
        transitionDuration: '0.6s',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;