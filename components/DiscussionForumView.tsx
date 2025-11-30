
import React, { useState, useMemo } from 'react';
import { DiscussionThread, User } from '../types';
import { ChatBubbleIcon, PlusIcon } from './icons';
import ThreadDetailView from './ThreadDetailView';

interface DiscussionForumViewProps {
  threads: DiscussionThread[];
  currentUser: User;
  onAddReply: (threadId: string, content: string) => void;
  onOpenCreateThreadModal: () => void;
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


const DiscussionForumView: React.FC<DiscussionForumViewProps> = ({ threads, currentUser, onAddReply, onOpenCreateThreadModal }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'lastActivity' | 'timestamp'>('lastActivity');

  const sortedThreads = useMemo(() => {
    return [...threads]
      .sort((a, b) => new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime());
  }, [threads, sortBy]);
  
  const selectedThread = useMemo(() => {
    return threads.find(t => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  if (selectedThread) {
    return (
      <ThreadDetailView 
        thread={selectedThread}
        currentUser={currentUser}
        onAddReply={onAddReply}
        onBack={() => setSelectedThreadId(null)}
      />
    );
  }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center gap-4 mb-4">
            <button onClick={onOpenCreateThreadModal} className="flex items-center bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition">
                <PlusIcon className="w-5 h-5 mr-2" />
                發起新討論
            </button>
             <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 flex-shrink-0">排序:</label>
                <div className="relative">
                    <select 
                        id="sort-by" 
                        value={sortBy} 
                        onChange={e => setSortBy(e.target.value as 'lastActivity' | 'timestamp')}
                        className="appearance-none block w-auto bg-gray-50 text-black border border-gray-300 hover:border-gray-400 px-3 py-2 pr-8 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="lastActivity">最新回覆</option>
                        <option value="timestamp">最新發布</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            {sortedThreads.map(thread => (
                <div 
                    key={thread.id} 
                    onClick={() => setSelectedThreadId(thread.id)}
                    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-blue-500 cursor-pointer transition"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedThreadId(thread.id); }}
                    aria-label={`查看討論串：${thread.title}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full mr-2">{thread.topic}</span>
                            <h4 className="font-bold text-lg text-gray-800 inline">{thread.title}</h4>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 flex-shrink-0 ml-4">
                            <ChatBubbleIcon className="w-4 h-4 mr-1.5"/>
                            <span>{thread.replies.length}</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 flex items-center">
                        <img src={thread.author.avatarUrl} alt={thread.author.name} className="w-5 h-5 rounded-full mr-2"/>
                        <span>由 <strong>{thread.author.name}</strong> 發起 • {timeAgo(thread.timestamp)}</span>
                        <span className="mx-2">•</span>
                        <span>最新活動: {timeAgo(thread.lastActivity)}</span>
                    </div>
                </div>
            ))}
        </div>

        {sortedThreads.length === 0 && (
             <div className="text-center py-20 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                <h3 className="text-xl font-medium text-gray-700">目前沒有任何討論</h3>
                <p className="text-gray-500 mt-2">
                  成為第一個發起討論的人吧！
                </p>
          </div>
        )}
    </div>
  );
};

export default DiscussionForumView;
