import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-transparent theme-bg-primary text-white hover:opacity-80",
      secondary: "border-transparent theme-surface theme-text hover:opacity-80",
      destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
      outline: "theme-text theme-border",
      success: "border-transparent bg-green-500 text-white hover:bg-green-600",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };