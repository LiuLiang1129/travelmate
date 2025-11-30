
import React from 'react';
import { Expense, User, Currency, ExpenseSplitMethod } from '../types';

interface ExpenseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (expense: Expense) => void;
    expense: Expense | null;
    userMap: Map<string, User>;
}

const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
        case 'JPY': return '¥';
        case 'TWD': return 'NT$';
        case 'USD': return '$';
        default: return currency;
    }
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-sm text-gray-800 font-semibold">{value}</span>
    </div>
);

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ isOpen, onClose, onEdit, expense, userMap }) => {
    if (!isOpen || !expense) return null;

    const payer = userMap.get(expense.payerId);
    const currencySymbol = getCurrencySymbol(expense.currency);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">帳務詳情</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Main Info */}
                    <div className="text-center">
                        <p className="text-gray-600">{expense.description}</p>
                        <p className="text-5xl font-bold text-gray-800 my-2">
                            {currencySymbol}{expense.amount.toLocaleString()}
                        </p>
                        {payer && (
                            <div className="flex items-center justify-center text-sm text-gray-500">
                                <span>由</span>
                                <img src={payer.avatarUrl} alt={payer.name} className="w-5 h-5 rounded-full mx-1.5" />
                                <span className="font-semibold">{payer.name}</span>
                                <span>支付</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Details Grid */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <DetailRow label="日期" value={new Date(expense.date + 'T00:00:00').toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} />
                         <hr className="my-1 border-gray-200" />
                        <DetailRow label="類別" value={expense.category} />
                        <hr className="my-1 border-gray-200" />
                        <DetailRow label="分攤方式" value={expense.splitMethod === ExpenseSplitMethod.Equal ? '平均分攤' : '自訂金額'} />
                    </div>

                    {/* Participants */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">分攤成員 ({expense.participants.length})</h3>
                        <div className="space-y-2">
                            {expense.participants.map(p => {
                                const user = userMap.get(p.userId);
                                return (
                                    <div key={p.userId} className="flex items-center justify-between p-2 bg-white border rounded-md">
                                        <div className="flex items-center">
                                            <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full mr-3" />
                                            <span className="text-gray-800">{user?.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-700">{currencySymbol}{p.share.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    {expense.notes && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">備註</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">{expense.notes}</p>
                        </div>
                    )}

                </div>

                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">關閉</button>
                    <button type="button" onClick={() => onEdit(expense)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                        編輯
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseDetailModal;
