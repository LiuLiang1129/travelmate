
import React from 'react';
import { Expense, User, UserRole, Currency } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface ExpenseListItemProps {
    expense: Expense;
    currentUser: User;
    userMap: Map<string, User>;
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => void;
    onSelect: (expenseId: string) => void;
}

const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
        case 'JPY': return '¥';
        case 'TWD': return 'NT$';
        case 'USD': return '$';
        default: return currency;
    }
}


const ExpenseListItem: React.FC<ExpenseListItemProps> = ({ expense, currentUser, userMap, onEdit, onDelete, onSelect }) => {
    const payer = userMap.get(expense.payerId);

    const canManageExpense = currentUser.role === UserRole.TourLeader || expense.authorId === currentUser.id;

    const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });

    return (
        <button
            onClick={() => onSelect(expense.id)}
            className="w-full text-left bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
            <div className="flex items-center">
                <div className="text-center w-12 mr-4 flex-shrink-0">
                    <p className="font-bold text-lg text-gray-700">{formattedDate.split('/')[1]}</p>
                    <p className="text-xs text-gray-500">{formattedDate.split('/')[0]}</p>
                </div>
                <div className="w-px bg-gray-200 h-10 mr-4"></div>
                <div>
                    <p className="font-semibold text-gray-800">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                        由 {payer?.name || '未知用戶'} 支付
                        <span className="text-xs bg-gray-100 text-gray-600 font-medium py-0.5 px-1.5 rounded-full ml-2">{expense.category}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="flex items-center font-bold text-gray-700 text-lg">
                    <span>{getCurrencySymbol(expense.currency)}</span>
                    <span className="ml-1">{expense.amount.toLocaleString()}</span>
                </div>
                {canManageExpense && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(expense); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 z-10" aria-label="編輯帳目">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 z-10" aria-label="刪除帳目">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </button>
    );
};

export default ExpenseListItem;
