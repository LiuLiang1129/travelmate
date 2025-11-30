
import React from 'react';
import { ItineraryItem, User, UserRole, ItineraryItemType } from '../types';
import ItineraryCard from './ItineraryCard';
import { PlusIcon } from './icons/PlusIcon';

interface ItineraryViewProps {
  day: number;
  items: ItineraryItem[];
  currentUser: User;
  onUpdateItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddComment: (itemId: string, text: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  startDate: Date;
  onSelectItem: (itemId: string) => void;
  onOpenModal: (item?: ItineraryItem, type?: ItineraryItemType) => void;
  onSaveAsTemplate: (item: ItineraryItem) => void;
  onToggleVoteClosed: (itemId: string) => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  day,
  items,
  currentUser,
  onUpdateItem,
  onDeleteItem,
  onAddComment,
  onVote,
  startDate,
  onSelectItem,
  onOpenModal,
  onSaveAsTemplate,
  onToggleVoteClosed,
}) => {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + day - 1);
  const dateString = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  const weekdayString = date.toLocaleDateString('zh-TW', { weekday: 'short' });

  const canEdit = currentUser.role === UserRole.TourLeader || currentUser.role === UserRole.Planner || currentUser.role === UserRole.Admin;

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          第 {day} 天行程
          <span className="text-xl font-normal text-gray-500 ml-4">{`${dateString} ${weekdayString}`}</span>
        </h2>
        {canEdit && (
            <div className="flex space-x-2">
                 <button 
                    onClick={() => onOpenModal()}
                    className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    新增項目
                </button>
            </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map(item => (
            <ItineraryCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onVote={onVote}
              onEdit={() => onOpenModal(item)}
              onDelete={onDeleteItem}
              canEdit={canEdit}
              onSelect={onSelectItem}
              onSaveAsTemplate={onSaveAsTemplate}
              onToggleVoteClosed={onToggleVoteClosed}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
          <h3 className="text-xl font-medium text-gray-700">本日尚無活動計畫。</h3>
          <p className="text-gray-500 mt-2">
            {canEdit ? "點擊「新增項目」開始規劃！" : "領隊稍後會在此新增項目。"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
