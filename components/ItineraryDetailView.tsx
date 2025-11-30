
import React, { useState } from 'react';
import { ItineraryItem, User, ItineraryItemType } from '../types';
import {
  PencilIcon, TrashIcon, ChatBubbleIcon, CheckCircleIcon, MapPinIcon, TicketIcon,
  BuildingOfficeIcon, UsersIcon, SunIcon, ArrowLeftIcon, ClockIcon, BookmarkIcon
} from './icons';
import VoteDisplay from './VoteDisplay';
import ImageViewerModal from './ImageViewerModal';

interface ItineraryDetailViewProps {
  item: ItineraryItem;
  currentUser: User;
  onBack: () => void;
  onAddComment: (itemId: string, text: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (itemId: string) => void;
  canEdit: boolean;
  onSaveAsTemplate: (item: ItineraryItem) => void;
  onToggleVoteClosed: (itemId: string) => void;
}

const ItemIcon: React.FC<{type: ItineraryItemType, className?: string}> = ({ type, className = "w-6 h-6" }) => {
    switch(type) {
        case ItineraryItemType.Accommodation: return <BuildingOfficeIcon className={className} />;
        case ItineraryItemType.Transportation: return <TicketIcon className={className} />;
        case ItineraryItemType.Dining: return <UsersIcon className={className} />;
        case ItineraryItemType.Attraction: return <MapPinIcon className={className} />;
        case ItineraryItemType.Activity: return <SunIcon className={className} />;
        default: return <CheckCircleIcon className={className} />;
    }
};

const ItineraryDetailView: React.FC<ItineraryDetailViewProps> = ({
  item, currentUser, onBack, onAddComment, onVote, onEdit, onDelete, canEdit, onSaveAsTemplate, onToggleVoteClosed
}) => {
  const [commentText, setCommentText] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(item.id, commentText);
      setCommentText('');
    }
  };

  const typeColorClasses = {
      [ItineraryItemType.Accommodation]: 'text-blue-600',
      [ItineraryItemType.Transportation]: 'text-green-600',
      [ItineraryItemType.Dining]: 'text-yellow-600',
      [ItineraryItemType.Attraction]: 'text-purple-600',
      [ItineraryItemType.Activity]: 'text-red-600',
  };

  return (
    <>
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            返回行程列表
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="relative cursor-pointer group" onClick={() => setIsImageModalOpen(true)}>
                <img className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105" src={item.imageUrl} alt={item.title} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-medium transition-opacity">
                        點擊查看大圖
                    </span>
                </div>
            </div>
            
            <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className={`uppercase tracking-wide text-sm font-bold ${typeColorClasses[item.type]}`}>{item.type}</div>
                    <h1 className="block mt-1 text-4xl leading-tight font-bold text-black">{item.title}</h1>
                </div>
                {canEdit && (
                <div className="flex space-x-1 flex-shrink-0">
                    <button onClick={() => onSaveAsTemplate(item)} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100 transition" aria-label="儲存為範本"><BookmarkIcon className="w-5 h-5"/></button>
                    <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"><PencilIcon className="w-5 h-5"/></button>
                    {item.type !== ItineraryItemType.Accommodation && (
                        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition"><TrashIcon className="w-5 h-5"/></button>
                    )}
                </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-6">
                <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2"/>
                    <span className="font-semibold">{item.time}{item.duration && ` (${item.duration})`}</span>
                </div>
                {item.location && (
                    <div className="flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{item.location}</span>
                    </div>
                )}
            </div>
            
            <p className="text-gray-700 text-base leading-relaxed">{item.description}</p>
            </div>

            {item.vote && (
            <div className="p-6 md:p-8 border-t border-gray-200">
                <VoteDisplay
                vote={item.vote}
                itemId={item.id}
                currentUser={currentUser}
                canEdit={canEdit}
                onVote={onVote}
                onToggleClosed={onToggleVoteClosed}
                />
            </div>
            )}

            <div className="p-6 md:p-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ChatBubbleIcon className="w-5 h-5 mr-2" />
                    留言 ({item.comments.length})
                </h4>
                <div className="space-y-4">
                {item.comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                    <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-9 h-9 rounded-full" />
                    <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{comment.author.name}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                    </div>
                    </div>
                ))}
                <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 pt-4">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                    <div className="flex-1">
                        <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="新增留言..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black"
                        rows={2}
                        />
                        <div className="text-right mt-2">
                            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400" disabled={!commentText.trim()}>
                                傳送留言
                            </button>
                        </div>
                    </div>
                </form>
                </div>
            </div>
        </div>
        </div>
        {isImageModalOpen && (
            <ImageViewerModal 
                imageUrl={item.imageUrl} 
                onClose={() => setIsImageModalOpen(false)} 
                altText={item.title}
            />
        )}
    </>
  );
};

export default ItineraryDetailView;
