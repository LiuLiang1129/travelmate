
import React, { useState } from 'react';
import { ItineraryItem, User, ItineraryItemType } from '../types';
import { PencilIcon, TrashIcon, ChatBubbleIcon, CheckCircleIcon, MapPinIcon, TicketIcon, BuildingOfficeIcon, UsersIcon, SunIcon, BookmarkIcon, ClockIcon } from './icons';
import VoteDisplay from './VoteDisplay';
import ImageViewerModal from './ImageViewerModal';

interface ItineraryCardProps {
  item: ItineraryItem;
  currentUser: User;
  onAddComment: (itemId: string, text: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (itemId: string) => void;
  canEdit: boolean;
  onSelect: (itemId: string) => void;
  onSaveAsTemplate: (item: ItineraryItem) => void;
  onToggleVoteClosed: (itemId: string) => void;
}

const ItemIcon: React.FC<{type: ItineraryItemType, className?: string}> = ({ type, className }) => {
    switch(type) {
        case ItineraryItemType.Accommodation: return <BuildingOfficeIcon className={className} />;
        case ItineraryItemType.Transportation: return <TicketIcon className={className} />;
        case ItineraryItemType.Dining: return <UsersIcon className={className} />;
        case ItineraryItemType.Attraction: return <MapPinIcon className={className} />;
        case ItineraryItemType.Activity: return <SunIcon className={className} />;
        default: return <CheckCircleIcon className={className} />;
    }
};

const ItineraryCard: React.FC<ItineraryCardProps> = ({ item, currentUser, onAddComment, onVote, onEdit, onDelete, canEdit, onSelect, onSaveAsTemplate, onToggleVoteClosed }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleStopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (commentText.trim()) {
      onAddComment(item.id, commentText);
      setCommentText('');
    }
  };
  
  const typeColorClasses = {
      [ItineraryItemType.Accommodation]: 'bg-blue-500',
      [ItineraryItemType.Transportation]: 'bg-green-500',
      [ItineraryItemType.Dining]: 'bg-yellow-500',
      [ItineraryItemType.Attraction]: 'bg-purple-500',
      [ItineraryItemType.Activity]: 'bg-red-500',
  };

  return (
    <>
        <div 
            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col md:flex-row cursor-pointer group"
            onClick={() => onSelect(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(item.id); }}
            aria-label={`查看 ${item.title} 的詳細資訊`}
        >
        <div className="md:w-1/3 relative overflow-hidden">
            <img 
                className="h-48 w-full object-cover md:h-full transition-transform duration-500 group-hover:scale-110" 
                src={item.imageUrl} 
                alt={item.title} 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsImageModalOpen(true);
                }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="p-6 flex flex-col justify-between flex-grow md:w-2/3">
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${typeColorClasses[item.type]}`}>
                                <ItemIcon type={item.type} className="w-5 h-5 text-white"/>
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{item.type}</p>
                        </div>
                        <h3 className="mt-2 text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">{item.title}</h3>
                    </div>
                    {canEdit && (
                        <div className="flex space-x-1 flex-shrink-0" onClick={handleStopPropagation}>
                        <button onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(item); }} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100 transition" aria-label="儲存為範本"><BookmarkIcon className="w-5 h-5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="編輯項目"><PencilIcon className="w-5 h-5"/></button>
                        {item.type !== ItineraryItemType.Accommodation && (
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition" aria-label="刪除項目"><TrashIcon className="w-5 h-5"/></button>
                        )}
                        </div>
                    )}
                </div>
                
                <div className="mt-3 flex items-center flex-wrap text-sm text-gray-600 gap-x-4 gap-y-1">
                    <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                        <strong>{item.time}</strong>
                    </div>
                    {item.duration && (
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{item.duration}</span>
                        </div>
                    )}
                    {item.location && (
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-2">•</span>
                            <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{item.location}</span>
                        </div>
                    )}
                </div>
                <p className="mt-4 text-gray-600 text-sm line-clamp-2">{item.description}</p>
            </div>

            {/* Voting Section */}
            {item.vote && (
            <div onClick={handleStopPropagation} className="pt-4 mt-4 border-t border-gray-100">
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

            {/* Comments Section */}
            <div className="mt-4">
            <button onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                <ChatBubbleIcon className="w-5 h-5 mr-2" />
                <span>{showComments ? '隱藏' : '顯示'}留言 ({item.comments.length})</span>
            </button>
            {showComments && (
                <div className="mt-4 space-y-4" onClick={handleStopPropagation}>
                {item.comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                    <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{comment.author.name}</p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                    </div>
                ))}
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mt-4">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="新增留言..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black"
                    />
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">傳送</button>
                </form>
                </div>
            )}
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

export default ItineraryCard;
