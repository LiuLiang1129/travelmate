
import React, { useState } from 'react';
import { SocialPost, User, UserRole } from '../types';
// FIX: Removed unused 'ShareIcon' import.
import { ChatBubbleIcon, EllipsisHorizontalIcon, GlobeAltIcon, HeartIcon, LockClosedIcon, PencilIcon, TrashIcon } from './icons';

interface SocialPostCardProps {
  post: SocialPost;
  currentUser: User;
  onDelete: (postId: string) => void;
  onEdit: (post: SocialPost) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

const SocialPostCard: React.FC<SocialPostCardProps> = ({ post, currentUser, onDelete, onEdit, onToggleLike, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isAuthor = post.author.id === currentUser.id;
  const hasLiked = post.likes.includes(currentUser.id);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "剛剛";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " 年前";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " 個月前";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " 天前";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " 小時前";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " 分鐘前";
    return Math.floor(seconds) + " 秒前";
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col">
      {/* Card Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <img src={post.author.avatarUrl} alt={post.author.name} className="w-11 h-11 rounded-full" />
        <div className="ml-3 flex-grow">
          <p className="font-bold text-gray-800">{post.author.name}</p>
          <div className="flex items-center text-xs text-gray-500 space-x-1">
            <span>{timeAgo(post.timestamp)}</span>
            <span>·</span>
            {post.isPublic ? (
                <span title="行程成員可見"><GlobeAltIcon className="w-3 h-3" /></span>
            ) : (
                <span title="僅自己可見"><LockClosedIcon className="w-3 h-3" /></span>
            )}
          </div>
        </div>
        {isAuthor && (
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                <button onClick={() => { onEdit(post); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <PencilIcon className="w-4 h-4 mr-2"/> 編輯
                </button>
                <button onClick={() => { onDelete(post.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <TrashIcon className="w-4 h-4 mr-2"/> 刪除
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
      </div>
      
      {/* Media */}
      {post.mediaUrl && (
        <div className="bg-gray-100">
          {post.mediaType === 'image' ? (
            <img src={post.mediaUrl} alt="遊記照片" className="w-full max-h-[600px] object-contain" />
          ) : (
            <video src={post.mediaUrl} controls className="w-full max-h-[600px]" />
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center p-2 border-t border-gray-100">
         <div className="flex space-x-2">
            <button onClick={() => onToggleLike(post.id)} className={`flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition ${hasLiked ? 'text-red-500' : 'text-gray-600'}`}>
                <HeartIcon className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} />
                <span className="font-semibold text-sm">{post.likes.length > 0 && post.likes.length}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                <ChatBubbleIcon className="w-6 h-6" />
                <span className="font-semibold text-sm">{post.comments.length > 0 && post.comments.length}</span>
            </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          {post.comments.map(comment => (
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
              className="w-full p-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black"
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default SocialPostCard;
