import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { formatAriary } from '../../constants';
import { BudgetSummary } from '../../types';
import { PencilIcon } from '../ui/Icons';

interface BudgetCardProps {
    summary: BudgetSummary;
    onEdit: () => void;
    onDelete: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ summary, onEdit, onDelete }) => {
    const { category_name, planned_amount, spent_amount, percentage_used, remaining_amount, is_extrapolated } = summary;

    // Status logic
    const hasNoBudget = planned_amount === 0;
    const isOverBudget = !hasNoBudget && percentage_used > 100;
    const isClose = !hasNoBudget && percentage_used > 90 && !isOverBudget;

    // Minimalist colors
    const statusBarColor = hasNoBudget ? 'bg-slate-200' : isOverBudget ? 'bg-red-600' : isClose ? 'bg-amber-400' : 'bg-slate-900';

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all hover:shadow-md group flex flex-col justify-between h-full min-h-[180px]">
            {/* Header: Category & Actions */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Catégorie</span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                        {category_name}
                        {is_extrapolated && (
                            <span title="Budget estimé sur la base de votre limite journalière" className="text-xs text-amber-500 cursor-help bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
                                Auto
                            </span>
                        )}
                    </h3>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Modifier"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    {(planned_amount > 0 || spent_amount > 0) && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Supprimer le budget"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Financial Data Center */}
            <div className="mt-6 mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold text-slate-900 tracking-tighter">
                        {formatAriary(spent_amount)}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mb-1">
                        / {hasNoBudget ? '---' : formatAriary(planned_amount)}
                    </span>
                </div>

                {/* Precision Progress Bar */}
                <div className="relative h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${statusBarColor}`}
                        style={{ width: `${Math.min(hasNoBudget ? (spent_amount > 0 ? 100 : 0) : percentage_used, 100)}%` }}
                    />
                </div>
            </div>

            {/* Footer: Remaining */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Restant</span>
                    <span className={`text-sm font-semibold truncate ${remaining_amount < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                        {hasNoBudget ? 'Non défini' : `${remaining_amount > 0 ? '+' : ''}${formatAriary(remaining_amount)}`}
                    </span>
                </div>

                {/* Status Pill */}
                {!hasNoBudget && (
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${isOverBudget ? 'bg-red-50 text-red-600' : isClose ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                        {percentage_used.toFixed(0)}%
                    </div>
                )}
            </div>
        </div>
    );
};
