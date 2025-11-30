
import React, { useState } from 'react';
import { DiscussionThread, User } from '../types';
import { ArrowLeftIcon, ChatBubbleIcon } from './icons';

interface ThreadDetailViewProps {
  thread: DiscussionThread;
  currentUser: User;
  onAddReply: (threadId: string, content: string) => void;
  onBack: () => void;
}

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

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({ thread, currentUser, onAddReply, onBack }) => {
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(thread.id, replyText);
      setReplyText('');
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        返回討論區
      </button>

      <div className="bg-white rounded-xl shadow-lg">
        {/* Thread Original Post */}
        <div className="p-6 border-b">
          <span className="text-sm font-semibold bg-blue-100 text-blue-800 py-1 px-2.5 rounded-full">{thread.topic}</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-3">{thread.title}</h1>
          <div className="flex items-center space-x-3 mt-4 text-sm text-gray-500">
            <img src={thread.author.avatarUrl} alt={thread.author.name} className="w-8 h-8 rounded-full" />
            <span className="font-semibold">{thread.author.name}</span>
            <span>•</span>
            <span>{timeAgo(thread.timestamp)}</span>
          </div>
          <p className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
          {thread.imageUrl && (
            <div className="mt-6">
              <img src={thread.imageUrl} alt="討論串圖片" className="max-w-full rounded-lg shadow-md mx-auto" />
            </div>
          )}
        </div>

        {/* Replies Section */}
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <ChatBubbleIcon className="w-5 h-5 mr-2" />
            回覆 ({thread.replies.length})
          </h3>
          
          {thread.replies.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(reply => (
             <div key={reply.id} className="flex items-start space-x-3">
              <img src={reply.author.avatarUrl} alt={reply.author.name} className="w-9 h-9 rounded-full mt-1" />
              <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-2 text-sm">
                  <p className="font-semibold text-gray-900">{reply.author.name}</p>
                  <p className="text-gray-500">• {timeAgo(reply.timestamp)}</p>
                </div>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}

          {/* Reply Form */}
          <form onSubmit={handleReplySubmit} className="flex items-start space-x-3 pt-6 border-t">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full" />
            <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="發表您的回覆..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black"
                  rows={3}
                />
                <div className="text-right mt-2">
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400" disabled={!replyText.trim()}>
                        送出回覆
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailView;
