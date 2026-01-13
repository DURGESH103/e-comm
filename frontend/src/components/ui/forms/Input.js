import React from 'react';

const Input = ({ 
  label,
  error,
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  const normalClasses = 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
        <input
          className={`${baseClasses} ${error ? errorClasses : normalClasses} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;