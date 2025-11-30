import React, { useState } from 'react';
import { SocialPost, User, UserRole, Expense, DiscussionThread } from '../types';
import { PlusIcon } from './icons';
import SocialPostCard from './SocialPostCard';
import ExpenseView from './ExpenseView';
import DiscussionForumView from './DiscussionForumView';
import CreateThreadModal from './CreateThreadModal';

interface SocialViewProps {
  posts: SocialPost[];
  currentUser: User;
  onOpenCreateModal: (post?: SocialPost) => void;
  onDeletePost: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  expenses: Expense[];
  allUsers: User[];
  onOpenAddExpenseModal: (expense?: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  discussionThreads: DiscussionThread[];
  onAddThread: (data: { title: string; content: string; topic: string; imageUrl?: string; }) => void;
  onAddReply: (threadId: string, content: string) => void;
}

type ActiveTab = 'posts' | 'expenses' | 'forum';

const SocialView: React.FC<SocialViewProps> = (props) => {
  const {
    posts, currentUser, onOpenCreateModal, onDeletePost, onToggleLike, onAddComment,
    expenses, allUsers, onOpenAddExpenseModal, onDeleteExpense,
    discussionThreads, onAddThread, onAddReply
  } = props;

  const [activeTab, setActiveTab] = useState<ActiveTab>('expenses');
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);

  const canPost = currentUser.role === UserRole.Traveler || currentUser.role === UserRole.TourLeader;
  
  const visiblePosts = posts.filter(p => p.isPublic || p.author.id === currentUser.id);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="bg-gray-200 p-1 rounded-full flex space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('forum')}
            className={`w-full sm:w-auto py-2 px-5 rounded-full text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'forum' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            討論區
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`w-full sm:w-auto py-2 px-5 rounded-full text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'expenses' ? 'bg-white text-teal-700 shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            帳務
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full sm:w-auto py-2 px-5 rounded-full text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'posts' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            遊記
          </button>
        </div>

        <div className="flex-shrink-0">
          {activeTab === 'posts' && canPost && (
            <button
              onClick={() => onOpenCreateModal()}
              className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              發布遊記
            </button>
          )}
        </div>
      </div>
      
      {activeTab === 'posts' && (
        visiblePosts.length > 0 ? (
          <div className="space-y-6">
            {visiblePosts.map(post => (
              <SocialPostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onDelete={onDeletePost}
                onEdit={onOpenCreateModal}
                onToggleLike={onToggleLike}
                onAddComment={onAddComment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            <h3 className="text-xl font-medium text-gray-700">還沒有任何遊記</h3>
            <p className="text-gray-500 mt-2">
              {canPost ? "點擊「發布遊記」分享您的第一張照片吧！" : "旅程開始後，成員們就可以在這裡分享照片和回憶。"}
            </p>
          </div>
        )
      )}

      {activeTab === 'expenses' && (
        <ExpenseView 
            expenses={expenses}
            currentUser={currentUser}
            allUsers={allUsers}
            onOpenAddExpenseModal={onOpenAddExpenseModal}
            onDeleteExpense={onDeleteExpense}
        />
      )}

      {activeTab === 'forum' && (
        <DiscussionForumView
          threads={discussionThreads}
          currentUser={currentUser}
          onAddReply={onAddReply}
          onOpenCreateThreadModal={() => setIsCreateThreadModalOpen(true)}
        />
      )}

      {isCreateThreadModalOpen && (
        <CreateThreadModal
          isOpen={isCreateThreadModalOpen}
          onClose={() => setIsCreateThreadModalOpen(false)}
          onSave={(data) => {
            onAddThread(data);
            setIsCreateThreadModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SocialView;