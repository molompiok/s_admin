import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-6">
                    {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
