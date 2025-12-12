
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed btn-click-effect focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-brand-primary";
  
  const variants = {
    // Primary: Dark Blue Background, White Text
    primary: "bg-brand-primary hover:bg-brand-hover text-white shadow-lg shadow-blue-900/30 border border-brand-hover/50",
    
    // Secondary: Panel color lighter, White Text
    secondary: "bg-app-surface hover:bg-app-hover text-brand-text border border-app-border",
    
    // Ghost: Transparent, hover effect
    ghost: "text-brand-muted hover:text-white hover:bg-app-surface",
    
    // Danger: Red tint
    danger: "bg-red-900/20 text-red-200 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : icon}
      {children}
    </button>
  );
};
