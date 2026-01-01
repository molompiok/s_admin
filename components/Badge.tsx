import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-red-50 text-red-700 border-red-100',
        info: 'bg-blue-50 text-blue-700 border-blue-100',
        neutral: 'bg-gray-50 text-gray-600 border-gray-100',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
