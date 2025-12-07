import React, { useState, useEffect, useMemo } from 'react';
import { Expense, User, ExpenseCategory, ExpenseParticipant, Currency, ExpenseSplitMethod, UserRole } from '../types';
import { CogIcon, TrashIcon } from './icons';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expenseData: Omit<Expense, 'id'>) => void;
    expense: Expense | null;
    currentUser: User;
    allUsers: User[];
    availableCurrencies: Currency[];
    onUpdateCurrencies: (currencies: Currency[]) => void;
}

const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
        case 'JPY': return '¥';
        case 'TWD': return 'NT$';
        case 'USD': return '$';
        default: return currency;
    }
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave, expense, currentUser, allUsers, availableCurrencies, onUpdateCurrencies }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [currency, setCurrency] = useState<Currency>(availableCurrencies[0] || 'JPY');
    const [payerId, setPayerId] = useState(currentUser.id);
    const [date, setDate] = useState(() => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    });
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Dining);
    const [notes, setNotes] = useState('');

    const [splitMethod, setSplitMethod] = useState<ExpenseSplitMethod>(ExpenseSplitMethod.Equal);
    const [participantIds, setParticipantIds] = useState<Set<string>>(new Set(allUsers.map(u => u.id)));
    const [customShares, setCustomShares] = useState<Record<string, number | ''>>({});

    const [newCurrency, setNewCurrency] = useState('');

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setAmount(expense.amount);
            setCurrency(expense.currency);
            setPayerId(expense.payerId);
            setDate(expense.date);
            setCategory(expense.category);
            setNotes(expense.notes || '');
            setSplitMethod(expense.splitMethod);
            const pIds = new Set(expense.participants.map(p => p.userId));
            setParticipantIds(pIds);

            if (expense.splitMethod === ExpenseSplitMethod.Custom) {
                const shares: Record<string, number> = {};
                expense.participants.forEach(p => {
                    shares[p.userId] = p.share;
                });
                setCustomShares(shares);
            } else {
                setCustomShares({});
            }
        } else {
            // Reset form for new expense
            setDescription('');
            setAmount('');
            setCurrency(availableCurrencies[0] || 'JPY');
            setPayerId(currentUser.id);
            const d = new Date();
            const offset = d.getTimezoneOffset() * 60000;
            setDate(new Date(d.getTime() - offset).toISOString().split('T')[0]);
            setCategory(ExpenseCategory.Dining);
            setNotes('');
            setSplitMethod(ExpenseSplitMethod.Equal);
            setParticipantIds(new Set(allUsers.map(u => u.id)));
            setCustomShares({});
        }
    }, [expense, currentUser, allUsers, isOpen, availableCurrencies]);

    useEffect(() => {
        // When participants change, update custom shares keys
        const newCustomShares: Record<string, number | ''> = {};
        allUsers.forEach(user => {
            if (participantIds.has(user.id)) {
                newCustomShares[user.id] = customShares[user.id] || '';
            }
        });
        setCustomShares(newCustomShares);
    }, [participantIds]);


    const handleParticipantToggle = (userId: string) => {
        setParticipantIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleToggleAllParticipants = () => {
        if (participantIds.size === allUsers.length) {
            setParticipantIds(new Set());
        } else {
            setParticipantIds(new Set(allUsers.map(u => u.id)));
        }
    }

    const { equalShare, totalCustomShare, remainingAmount, isCustomShareValid } = useMemo(() => {
        const numParticipants = participantIds.size;
        const totalAmount = Number(amount) || 0;

        const equalShare = numParticipants > 0 ? (totalAmount / numParticipants).toFixed(2) : '0.00';

        const totalCustomShare = Object.values(customShares).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);
        const remainingAmount = totalAmount - totalCustomShare;
        const isCustomShareValid = Math.abs(remainingAmount) < 0.01;

        return { equalShare, totalCustomShare, remainingAmount, isCustomShareValid };
    }, [amount, participantIds, customShares]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || amount <= 0 || participantIds.size === 0) return;

        if (splitMethod === ExpenseSplitMethod.Custom && !isCustomShareValid) {
            alert('自訂分攤金額總和不等於總金額！');
            return;
        }

        let participants: ExpenseParticipant[] = [];
        if (splitMethod === ExpenseSplitMethod.Equal) {
            const count = Number(participantIds.size);
            const share = Number(amount) / (count > 0 ? count : 1);
            participants = [...participantIds].map(userId => ({
                userId,
                share,
            }));
        } else { // Custom
            participants = [...participantIds].map(userId => ({
                userId,
                share: Number(customShares[userId]) || 0,
            })).filter(p => p.share > 0);
        }

        onSave({
            description,
            amount: Number(amount),
            currency,
            payerId,
            participants,
            date,
            category,
            notes,
            splitMethod,
            authorId: expense?.authorId || currentUser.id,
        });
    };

    const handleAddCurrency = () => {
        const code = newCurrency.trim().toUpperCase();
        if (code && code.length >= 2 && code.length <= 4 && !availableCurrencies.includes(code)) {
            onUpdateCurrencies([...availableCurrencies, code].sort());
            setNewCurrency('');
        } else {
            alert('無效或重複的幣別代碼。代碼長度應為 2-4 個字元。');
        }
    };

    const handleRemoveCurrency = (currencyToRemove: Currency) => {
        if (availableCurrencies.length > 1) { // Prevent removing the last currency
            // If the currently selected currency is the one being removed, select another one.
            if (currency === currencyToRemove) {
                const newSelection = availableCurrencies.find(c => c !== currencyToRemove);
                if (newSelection) {
                    setCurrency(newSelection);
                }
            }
            onUpdateCurrencies(availableCurrencies.filter(c => c !== currencyToRemove));
        } else {
            alert('至少需要保留一種幣別。');
        }
    };

    const isSaveDisabled = !amount || amount <= 0 || participantIds.size === 0 || (splitMethod === ExpenseSplitMethod.Custom && !isCustomShareValid);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{expense ? '編輯帳目' : '新增帳目'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">項目說明</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金額</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required min="0.01" step="0.01" />
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">幣別</label>
                            <select id="currency" value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                                {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {currentUser.role === UserRole.TourLeader && (
                        <details className="pt-2">
                            <summary className="text-sm font-medium text-gray-600 cursor-pointer flex items-center hover:text-gray-900">
                                管理幣別選項
                                <CogIcon className="w-4 h-4 ml-1 text-gray-500" />
                            </summary>
                            <div className="mt-2 p-4 border rounded-md bg-gray-50 space-y-3">
                                <h4 className="font-semibold text-gray-800">目前的幣別</h4>
                                <ul className="space-y-2 max-h-32 overflow-y-auto">
                                    {availableCurrencies.map(c => (
                                        <li key={c} className="flex justify-between items-center bg-white p-2 rounded border">
                                            <span className="font-mono">{c}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCurrency(c)}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label={`移除 ${c}`}
                                                disabled={availableCurrencies.length <= 1}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center space-x-2 pt-3 border-t">
                                    <input
                                        type="text"
                                        value={newCurrency}
                                        onChange={e => setNewCurrency(e.target.value)}
                                        placeholder="新增幣別 (例: EUR)"
                                        className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                                        maxLength={4}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCurrency(); } }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCurrency}
                                        className="bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 flex-shrink-0"
                                    >
                                        新增
                                    </button>
                                </div>
                            </div>
                        </details>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="payerId" className="block text-sm font-medium text-gray-700">付款人</label>
                            <select id="payerId" value={payerId} onChange={e => setPayerId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                                {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">類別</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required />
                    </div>

                    {/* Split Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">分攤方式</label>
                        <div className="mt-2 flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setSplitMethod(ExpenseSplitMethod.Equal)} className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md w-1/2 ${splitMethod === ExpenseSplitMethod.Equal ? 'bg-blue-600 text-white border-blue-600 z-10' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>平均分攤</button>
                            <button type="button" onClick={() => setSplitMethod(ExpenseSplitMethod.Custom)} className={`-ml-px px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md w-1/2 ${splitMethod === ExpenseSplitMethod.Custom ? 'bg-blue-600 text-white border-blue-600 z-10' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>自訂金額</button>
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">分攤成員</label>
                        <div className="mt-2 p-3 border border-gray-200 rounded-md max-h-56 overflow-y-auto">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                <label htmlFor="toggleAll" className="flex items-center text-sm font-medium">
                                    <input type="checkbox" id="toggleAll" checked={participantIds.size === allUsers.length} onChange={handleToggleAllParticipants} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                                    所有人
                                </label>
                                {splitMethod === ExpenseSplitMethod.Equal && (
                                    <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        每人: <span className="font-bold">{getCurrencySymbol(currency)}{equalShare}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                {allUsers.map(user => (
                                    <div key={user.id} className={`flex items-center p-2 rounded-md ${participantIds.has(user.id) ? '' : 'opacity-60'}`}>
                                        <input type="checkbox" id={`user-${user.id}`} checked={participantIds.has(user.id)} onChange={() => handleParticipantToggle(user.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full ml-3 mr-2" />
                                        <label htmlFor={`user-${user.id}`} className="text-sm text-gray-800 flex-grow cursor-pointer">{user.name}</label>

                                        {splitMethod === ExpenseSplitMethod.Custom && participantIds.has(user.id) && (
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">{getCurrencySymbol(currency)}</span>
                                                <input
                                                    type="number"
                                                    value={customShares[user.id] || ''}
                                                    onChange={e => setCustomShares(prev => ({ ...prev, [user.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                                                    className="w-28 pl-7 pr-2 py-1 border border-gray-300 rounded-md text-sm text-right bg-gray-50 text-black"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {splitMethod === ExpenseSplitMethod.Custom && (
                            <div className={`mt-2 p-2 rounded-md text-sm text-right ${isCustomShareValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                已分配: {getCurrencySymbol(currency)}{totalCustomShare.toFixed(2)} / 待分配: <span className="font-bold">{getCurrencySymbol(currency)}{remainingAmount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"></textarea>
                    </div>
                </form>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
                    <button type="submit" formNoValidate onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={isSaveDisabled}>
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;