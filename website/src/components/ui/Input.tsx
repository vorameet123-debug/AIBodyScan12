import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-3 
              ${icon ? 'pl-10' : ''}
              bg-slate-800 
              border ${error ? 'border-rose-500' : 'border-slate-600'}
              rounded-xl 
              text-white 
              placeholder:text-slate-400
              focus:outline-none 
              focus:ring-2 
              ${error ? 'focus:ring-rose-500/20 focus:border-rose-500' : 'focus:ring-accent-500/20 focus:border-accent-500'}
              transition-all
              disabled:opacity-50 
              disabled:cursor-not-allowed
              ${className}
            `}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-rose-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
