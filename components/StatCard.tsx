import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    icon?: React.ReactNode;
    primary?: boolean;
}

export function StatCard({ title, value, trend, icon, primary }: StatCardProps) {
    if (primary) {
        return (
            <div className="bg-emerald-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-emerald-100 font-medium">{title}</span>
                        {icon && <div className="p-2 bg-emerald-400/30 rounded-lg">{icon}</div>}
                    </div>
                    <div className="text-3xl font-bold mb-2">{value}</div>
                    {trend && (
                        <div className="flex items-center text-sm text-emerald-50">
                            <span className="bg-emerald-400/30 px-1.5 py-0.5 rounded text-xs font-semibold mr-2 flex items-center">
                                {trend.positive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {trend.value}%
                            </span>
                            <span>{trend.label}</span>
                        </div>
                    )}
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
            </div>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 font-medium text-sm">{title}</span>
                {icon && <div className="text-gray-400">{icon}</div>}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
            {trend && (
                <div className={`flex items-center text-xs ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className={`px-1.5 py-0.5 rounded font-semibold mr-2 flex items-center ${trend.positive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {trend.positive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {trend.value}%
                    </span>
                    <span className="text-gray-400">{trend.label}</span>
                </div>
            )}
        </Card>
    );
}
