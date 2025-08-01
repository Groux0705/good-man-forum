import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md border border-blue-600/20 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-95",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm active:scale-95",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm active:scale-95",
      ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
      link: "text-primary underline-offset-4 hover:underline active:scale-95",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const classes = clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: clsx(classes, (children.props as any).className),
        ref,
        ...props,
      } as any);
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };