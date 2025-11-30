import React, { useMemo, useState } from 'react';
import { Expense, User, Settlement, UserRole } from '../types';
import SettlementSummary from './SettlementSummary';
import ExpenseListItem from './ExpenseListItem';
import { PlusIcon, CurrencyYenIcon } from './icons';
import ExpenseDetailModal from './ExpenseDetailModal';

interface ExpenseViewProps {
  expenses: Expense[];
  currentUser: User;
  allUsers: User[];
  onOpenAddExpenseModal: (expense?: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const calculateSettlements = (expenses: Expense[], allUsers: User[]): { settlements: Settlement[], totalSpending: number } => {
    const balances = new Map<string, number>();
    allUsers.forEach(u => balances.set(u.id, 0));

    let totalSpending = 0;
    
    expenses.forEach(expense => {
        totalSpending += expense.amount;
        const payerBalance = balances.get(expense.payerId) || 0;
        balances.set(expense.payerId, payerBalance + expense.amount);

        expense.participants.forEach(p => {
            const participantBalance = balances.get(p.userId) || 0;
            balances.set(p.userId, participantBalance - p.share);
        });
    });

    const debtors = allUsers
        .map(u => ({ user: u, balance: balances.get(u.id) || 0 }))
        .filter(item => item.balance < -0.01) // Use a small epsilon for float comparison
        .sort((a, b) => a.balance - b.balance);

    const creditors = allUsers
        .map(u => ({ user: u, balance: balances.get(u.id) || 0 }))
        .filter(item => item.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);

    const settlements: Settlement[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
        const debtor = debtors[debtorIndex];
        const creditor = creditors[creditorIndex];
        const amountToSettle = Math.min(-debtor.balance, creditor.balance);

        if (amountToSettle > 0.01) {
            settlements.push({
                from: debtor.user,
                to: creditor.user,
                amount: Math.round(amountToSettle),
            });

            debtor.balance += amountToSettle;
            creditor.balance -= amountToSettle;
        }

        if (Math.abs(debtor.balance) < 0.01) {
            debtorIndex++;
        }
        if (Math.abs(creditor.balance) < 0.01) {
            creditorIndex++;
        }
    }
    
    return { settlements, totalSpending };
};


const ExpenseView: React.FC<ExpenseViewProps> = ({ expenses, currentUser, allUsers, onOpenAddExpenseModal, onDeleteExpense }) => {
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const { settlements, totalSpending } = useMemo(() => calculateSettlements(expenses, allUsers), [expenses, allUsers]);
  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);
  const canAddExpense = currentUser.role === UserRole.Traveler || currentUser.role === UserRole.TourLeader;

  const handleViewExpense = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      setViewingExpense(expense);
    }
  };

  const handleEditFromDetail = (expenseToEdit: Expense) => {
    setViewingExpense(null); // Close detail modal
    onOpenAddExpenseModal(expenseToEdit); // Open edit modal
  };


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Total Spending & Add Transaction */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h3 className="text-lg font-semibold text-gray-700">旅程總支出</h3>
            <div className="flex items-center mt-1">
                <CurrencyYenIcon className="w-8 h-8 mr-2 text-teal-600" />
                <span className="text-4xl font-bold text-gray-800">{totalSpending.toLocaleString()}</span>
            </div>
        </div>
        {canAddExpense && (
            <button
                onClick={() => onOpenAddExpenseModal()}
                className="flex items-center bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition w-full sm:w-auto justify-center"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                新增帳目
            </button>
        )}
      </div>

      {/* Settle Accounts */}
      <SettlementSummary settlements={settlements} />
      
      {/* Expense Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">費用明細</h3>
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map(expense => (
              <ExpenseListItem 
                key={expense.id}
                expense={expense}
                currentUser={currentUser}
                userMap={userMap}
                onEdit={() => onOpenAddExpenseModal(expense)}
                onDelete={onDeleteExpense}
                onSelect={handleViewExpense}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
             <h3 className="text-xl font-medium text-gray-700">目前沒有任何帳目</h3>
             <p className="text-gray-500 mt-2">點擊「新增帳目」來記錄您的第一筆花費。</p>
          </div>
        )}
      </div>

      <ExpenseDetailModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        onEdit={handleEditFromDetail}
        expense={viewingExpense}
        userMap={userMap}
      />
    </div>
  );
};

export default ExpenseView;