import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl transition-all duration-200';
  
  const variants = {
    default: 'shadow-md border border-slate-100',
    elevated: 'shadow-lg border border-slate-100',
    outlined: 'border-2 border-slate-200 shadow-sm',
    ghost: 'bg-slate-50 border border-slate-100'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverEffect = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverEffect} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;