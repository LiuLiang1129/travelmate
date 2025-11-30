
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ItineraryView from './components/ItineraryView';
import ItineraryDetailView from './components/ItineraryDetailView';
import AnnouncementPanel from './components/AnnouncementPanel';
import Sidebar from './components/Sidebar';
// FIX: Removed DiscussionTopic as it is not exported from types.ts and not used.
import { User, UserRole, ItineraryItem, Announcement, Comment, ItineraryItemType, ItineraryTemplate, Vote, ChecklistItem, SocialPost, SocialComment, Expense, ExpenseParticipant, DiscussionThread, DiscussionReply, TransportationEvent } from './types';
import { MOCK_TEMPLATES, MOCK_SOCIAL_POSTS, MOCK_EXPENSES, MOCK_DISCUSSION_THREADS, ALL_USERS } from './constants';
import { api } from './services/api';
import ItineraryItemModal from './components/ItineraryItemModal';
import TemplatesModal from './components/TemplatesModal';
import TripInfoView from './components/TripInfoView';
import ChecklistModal from './components/ChecklistModal';
import LandingPage from './components/LandingPage';
import TripCodeModal from './components/TripCodeModal';
import BottomNavBar, { MainView } from './components/BottomNavBar';
import AIGuideView from './components/AIGuideView';
import SocialView from './components/SocialView';
import SettingsView from './components/SettingsView';
import CreatePostModal from './components/CreatePostModal';
import AddExpenseModal from './components/AddExpenseModal';
import TransportModal from './components/TransportModal';


type ModalVotePayload = {
  question: string;
  options: { id: string; text: string }[];
} | null;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [startDate, setStartDate] = useState(new Date('2024-10-26'));
  const [totalDays, setTotalDays] = useState(1);
  const [selectedView, setSelectedView] = useState<'trip-info' | number>('trip-info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>('itinerary');


  // Transportation State
  const [transportations, setTransportations] = useState<TransportationEvent[]>([]);
  const [editingTransport, setEditingTransport] = useState<TransportationEvent | null>(null);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);

  // Checklist State
  const [checklistTarget, setChecklistTarget] = useState<{ type: 'transport', id: string } | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  // Social State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

  // Expense State
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['JPY', 'TWD', 'USD']);

  // Discussion Forum State
  const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>(MOCK_DISCUSSION_THREADS);

  // Template State
  const [templates, setTemplates] = useState<ItineraryTemplate[]>(MOCK_TEMPLATES);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [forcedType, setForcedType] = useState<ItineraryItemType | null>(null);

  // Trip Code State
  const [tripCode, setTripCode] = useState<string | null>(null);
  const [isTripCodeModalOpen, setIsTripCodeModalOpen] = useState(false);

  const canManage = currentUser ? (currentUser.role === UserRole.TourLeader || currentUser.role === UserRole.Planner || currentUser.role === UserRole.Admin) : false;

  const expenseUsers = useMemo(() =>
    ALL_USERS.filter(user =>
      user.role !== UserRole.Planner && user.role !== UserRole.Admin
    ),
    []);

  const selectedDay = typeof selectedView === 'number' ? selectedView : 1;
  const selectedItem = useMemo(() => itinerary.find(item => item.id === selectedItemId) || null, [selectedItemId, itinerary]);
  const allAccommodations = useMemo(() => itinerary.filter(item => item.type === ItineraryItemType.Accommodation).sort((a, b) => a.day - b.day), [itinerary]);


  const handleLogin = (user: User) => {
    // For "Create New" it re-initializes the itinerary.
    if (user.role === UserRole.Planner || user.role === UserRole.Admin) {
      // setItinerary(MOCK_ITINERARY); // Removed mock reset
      // setAnnouncements(MOCK_ANNOUNCEMENTS); // Removed mock reset
      // setTotalDays(3);
      // setTransportations(MOCK_TRANSPORTATIONS); // Removed mock reset
      setSocialPosts(MOCK_SOCIAL_POSTS);
      setExpenses(MOCK_EXPENSES);
      setDiscussionThreads(MOCK_DISCUSSION_THREADS);
      setTripCode(null); // This will trigger the modal via useEffect
      setSelectedView('trip-info');
      setSelectedItemId(null);
    } else {
      // For "Join" flow from landing page
      setTripCode("0000");
    }
    setCurrentUser(user);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itineraryData, announcementsData, transportationsData] = await Promise.all([
          api.itinerary.list(),
          api.announcements.list(),
          api.transportations.list()
        ]);
        setItinerary(itineraryData);
        setAnnouncements(announcementsData);
        setTransportations(transportationsData);

        if (itineraryData.length > 0) {
          setTotalDays(Math.max(...itineraryData.map(item => item.day), 1));
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === UserRole.Planner || currentUser.role === UserRole.Admin) && tripCode === null) {
      setIsTripCodeModalOpen(true);
    }
  }, [currentUser, tripCode]);

  const handleSetTripCode = (code: string) => {
    setTripCode(code);
    setIsTripCodeModalOpen(false);
  };

  const handleUpdateItem = useCallback(async (updatedItem: ItineraryItem) => {
    try {
      const savedItem = await api.itinerary.update(updatedItem);
      setItinerary(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
    } catch (e) {
      console.error(e);
      alert('Failed to update item');
    }
  }, []);

  const handleAddItem = useCallback(async (newItem: Omit<ItineraryItem, 'id'>) => {
    try {
      const fullNewItem: ItineraryItem = {
        ...newItem,
        id: `item-${Date.now()}`
      };
      const savedItem = await api.itinerary.create(fullNewItem);
      setItinerary(prev => [...prev, savedItem].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)));
    } catch (e) {
      console.error(e);
      alert('Failed to add item');
    }
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (window.confirm('確定要刪除此項目嗎？')) {
      try {
        await api.itinerary.delete(itemId);
        setItinerary(prev => prev.filter(item => item.id !== itemId));
        return true;
      } catch (e) {
        console.error(e);
        alert('Failed to delete item');
        return false;
      }
    }
    return false;
  }, []);

  const handleAddComment = useCallback((itemId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      text,
      timestamp: new Date().toISOString()
    };
    setItinerary(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, comments: [...item.comments, newComment] }
        : item
    ));
  }, [currentUser]);

  const handleVote = useCallback((itemId: string, optionId: string) => {
    if (!currentUser) return;
    setItinerary(prev => prev.map(item => {
      if (item.id === itemId && item.vote) {
        const newVoteOptions = item.vote.options.map(opt => {
          let newVoters = opt.voters.filter(voterId => voterId !== currentUser.id);
          if (opt.id === optionId) {
            newVoters.push(currentUser.id);
          }
          return { ...opt, voters: newVoters };
        });
        return { ...item, vote: { ...item.vote, options: newVoteOptions } };
      }
      return item;
    }));
  }, [currentUser]);

  const handleToggleVoteClosed = useCallback((itemId: string) => {
    setItinerary(prev => prev.map(item => {
      if (item.id === itemId && item.vote) {
        return {
          ...item,
          vote: { ...item.vote, isClosed: !item.vote.isClosed }
        };
      }
      return item;
    }));
  }, []);

  const handlePostAnnouncement = useCallback(async (text: string, imageUrl?: string) => {
    if (!currentUser) return;
    try {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        author: currentUser,
        text,
        timestamp: new Date().toISOString(),
        readBy: [currentUser.id],
        imageUrl,
      };
      const savedAnnouncement = await api.announcements.create(newAnnouncement);
      setAnnouncements(prev => [savedAnnouncement, ...prev]);
    } catch (e) {
      console.error(e);
      alert('Failed to post announcement');
    }
  }, [currentUser]);

  const handleUpdateAnnouncement = useCallback(async (updatedAnnouncement: Announcement) => {
    try {
      const savedAnnouncement = await api.announcements.update(updatedAnnouncement);
      setAnnouncements(prev => prev.map(ann => ann.id === savedAnnouncement.id ? savedAnnouncement : ann));
    } catch (e) {
      console.error(e);
      alert('Failed to update announcement');
    }
  }, []);

  const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
    if (window.confirm('確定要刪除這則公告嗎？')) {
      try {
        await api.announcements.delete(announcementId);
        setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      } catch (e) {
        console.error(e);
        alert('Failed to delete announcement');
      }
    }
  }, []);

  const handleAddDay = useCallback(() => {
    setTotalDays(prev => {
      const newTotal = prev + 1;
      setSelectedView(newTotal);
      return newTotal;
    });
  }, []);

  // Transportation Handlers
  const handleUpdateTransportation = useCallback(async (updatedTransport: TransportationEvent) => {
    try {
      // Check if exists to decide update or create logic if needed, but here we assume update if ID exists.
      // Wait, handleUpdateTransportation was used for both create (if not exists) and update in previous logic?
      // Previous logic:
      // const exists = prev.some(t => t.id === updatedTransport.id);
      // if (exists) update else add.
      // So I need to check if it exists in state or try update and if 404 then create?
      // Better: The modal usually passes an ID. If it's a new item, the modal might generate ID or pass without ID?
      // TransportModal passes `transport` which has ID.
      // Let's check TransportModal usage.
      // It seems TransportModal creates a new object with ID if it's new.
      // So I should check if it exists in DB?
      // Or just try update, if fail then create?
      // Or check local state `transportations` to see if ID exists.

      const exists = transportations.some(t => t.id === updatedTransport.id);
      let savedTransport;
      if (exists) {
        savedTransport = await api.transportations.update(updatedTransport);
      } else {
        savedTransport = await api.transportations.create(updatedTransport);
      }

      setTransportations(prev => {
        if (exists) {
          return prev.map(t => t.id === savedTransport.id ? savedTransport : t);
        }
        return [...prev, savedTransport].sort((a, b) => new Date(a.segments[0].departureDateTime).getTime() - new Date(b.segments[0].departureDateTime).getTime());
      });
    } catch (e) {
      console.error(e);
      alert('Failed to save transportation');
    }
  }, [transportations]);

  const handleDeleteTransportation = useCallback(async (id: string) => {
    if (window.confirm("確定要刪除這筆交通安排嗎？")) {
      try {
        await api.transportations.delete(id);
        setTransportations(prev => prev.filter(t => t.id !== id));
      } catch (e) {
        console.error(e);
        alert('Failed to delete transportation');
      }
    }
  }, []);

  const handleOpenTransportModal = (transport?: TransportationEvent) => {
    setEditingTransport(transport || null);
    setIsTransportModalOpen(true);
  };

  const handleOpenChecklistModal = (transportId: string) => {
    setChecklistTarget({ type: 'transport', id: transportId });
    setIsChecklistModalOpen(true);
  };

  const handleUpdateChecklist = (checklist: ChecklistItem[]) => {
    if (checklistTarget?.type === 'transport') {
      setTransportations(prev => prev.map(t =>
        t.id === checklistTarget.id ? { ...t, checklist } : t
      ));
    }
  };

  const currentChecklist = useMemo(() => {
    if (checklistTarget?.type === 'transport') {
      return transportations.find(t => t.id === checklistTarget.id)?.checklist || [];
    }
    return [];
  }, [checklistTarget, transportations]);

  // Template Handlers
  const handleSaveAsTemplate = useCallback((item: ItineraryItem) => {
    if (templates.some(t => t.title === item.title)) {
      alert(`範本 "${item.title}" 已存在。`);
      return;
    }
    const newTemplate: ItineraryTemplate = {
      id: `template-${Date.now()}`,
      title: item.title,
      type: item.type,
      duration: item.duration || '',
      description: item.description,
      location: item.location || '',
    };
    setTemplates(prev => [...prev, newTemplate]);
    alert(`範本 "${item.title}" 已儲存！`);
  }, [templates]);

  const handleCreateTemplate = useCallback((templateData: Omit<ItineraryTemplate, 'id'>) => {
    const newTemplate: ItineraryTemplate = {
      id: `template-${Date.now()}`,
      ...templateData
    };
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const handleUpdateTemplate = useCallback((updatedTemplate: ItineraryTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  }, []);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (window.confirm('確定要刪除此範本嗎？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  }, []);

  // Modal Handlers
  const handleOpenModal = useCallback((item?: ItineraryItem, type?: ItineraryItemType) => {
    setEditingItem(item || null);
    setForcedType(item ? null : type || null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForcedType(null);
  }, []);

  const handleSaveItem = useCallback((itemData: Omit<ItineraryItem, 'id' | 'comments' | 'vote'> & { vote: ModalVotePayload }) => {
    if (editingItem) {
      const originalVote = editingItem.vote;
      let finalVote: Vote | null = null;

      if (itemData.vote) {
        const newOptions = itemData.vote.options.map(newOpt => {
          const originalOption = originalVote?.options.find(o => o.id === newOpt.id);
          return {
            id: newOpt.id,
            text: newOpt.text,
            voters: originalOption?.voters || []
          };
        });

        finalVote = {
          id: originalVote?.id || `vote-${Date.now()}`,
          question: itemData.vote.question,
          isClosed: originalVote?.isClosed || false,
          options: newOptions
        };
      }
      const { vote, ...restItemData } = itemData;
      handleUpdateItem({ ...editingItem, ...restItemData, vote: finalVote });
    } else {
      let finalVote: Vote | null = null;
      if (itemData.vote) {
        finalVote = {
          id: `vote-${Date.now()}`,
          question: itemData.vote.question,
          isClosed: false,
          options: itemData.vote.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            voters: []
          }))
        };
      }
      const { vote, ...restItemData } = itemData;
      const newItem: Omit<ItineraryItem, 'id'> = {
        ...restItemData,
        comments: [],
        vote: finalVote,
      };
      handleAddItem(newItem);
    }
    handleCloseModal();
  }, [editingItem, handleAddItem, handleUpdateItem, handleCloseModal]);

  // Social Post Handlers
  const handleOpenCreatePostModal = useCallback((postToEdit?: SocialPost) => {
    setEditingPost(postToEdit || null);
    setIsCreatePostModalOpen(true);
  }, []);

  const handleCloseCreatePostModal = useCallback(() => {
    setIsCreatePostModalOpen(false);
    setEditingPost(null);
  }, []);

  const handleSavePost = useCallback((postData: Omit<SocialPost, 'id' | 'author' | 'timestamp' | 'comments' | 'likes'>) => {
    if (!currentUser) return;
    if (editingPost) {
      // Update existing post
      const updatedPost = { ...editingPost, ...postData };
      setSocialPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
    } else {
      // Create new post
      const newPost: SocialPost = {
        id: `sp-${Date.now()}`,
        author: currentUser,
        timestamp: new Date().toISOString(),
        comments: [],
        likes: [],
        ...postData,
      };
      setSocialPosts(prev => [newPost, ...prev]);
    }
    handleCloseCreatePostModal();
  }, [currentUser, editingPost, handleCloseCreatePostModal]);

  const handleDeletePost = useCallback((postId: string) => {
    if (window.confirm('確定要刪除這篇遊記嗎？')) {
      setSocialPosts(prev => prev.filter(p => p.id !== postId));
    }
  }, []);

  const handleToggleLike = useCallback((postId: string) => {
    if (!currentUser) return;
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUser.id);
        const newLikes = hasLiked
          ? post.likes.filter(uid => uid !== currentUser.id)
          : [...post.likes, currentUser.id];
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  }, [currentUser]);

  const handleAddSocialComment = useCallback((postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: SocialComment = {
      id: `sc-${Date.now()}`,
      author: currentUser,
      text,
      timestamp: new Date().toISOString(),
    };
    setSocialPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));
  }, [currentUser]);

  // Expense Handlers
  const handleOpenAddExpenseModal = useCallback((expenseToEdit?: Expense) => {
    setEditingExpense(expenseToEdit || null);
    setIsAddExpenseModalOpen(true);
  }, []);

  const handleCloseAddExpenseModal = useCallback(() => {
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);
  }, []);

  const handleSaveExpense = useCallback((expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      // Update
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...editingExpense, ...expenseData } : e));
    } else {
      // Create
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
      };
      setExpenses(prev => [...prev, newExpense].sort((a, b) => b.date.localeCompare(a.date)));
    }
    handleCloseAddExpenseModal();
  }, [editingExpense, handleCloseAddExpenseModal]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    if (window.confirm('確定要刪除這筆帳目嗎？')) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    }
  }, []);

  // Discussion Forum Handlers
  const handleAddThread = useCallback((threadData: Omit<DiscussionThread, 'id' | 'author' | 'timestamp' | 'replies' | 'lastActivity'>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newThread: DiscussionThread = {
      ...threadData,
      id: `thread-${Date.now()}`,
      author: currentUser,
      timestamp: now,
      replies: [],
      lastActivity: now,
    };
    setDiscussionThreads(prev => [newThread, ...prev]);
  }, [currentUser]);

  const handleAddReply = useCallback((threadId: string, content: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newReply: DiscussionReply = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: now,
    };
    setDiscussionThreads(prev => prev.map(thread =>
      thread.id === threadId
        ? { ...thread, replies: [...thread.replies, newReply], lastActivity: now }
        : thread
    ));
  }, [currentUser]);


  const itemsForSelectedDay = useMemo(() => itinerary
    .filter(item => item.day === selectedDay && item.type !== ItineraryItemType.Accommodation)
    .sort((a, b) => a.time.localeCompare(b.time)), [itinerary, selectedDay]);

  const handleSelectView = (view: 'trip-info' | number) => {
    setSelectedItemId(null); // Return to list view when changing view
    setSelectedView(view);
    setMainView('itinerary');
  }

  const handleSelectMainView = (view: MainView) => {
    if (view !== 'itinerary' && selectedItemId) {
      setSelectedItemId(null);
    }
    setMainView(view);
  };

  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen max-h-screen flex flex-col font-sans bg-gray-100">
      <Header
        currentUser={currentUser}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <div className="flex-grow flex overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        <div className={`
            fixed inset-y-0 left-0 z-40 w-64
            transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 md:flex-shrink-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar
            totalDays={totalDays}
            selectedView={selectedView}
            onSelectView={handleSelectView}
            startDate={startDate}
            onAddDay={handleAddDay}
            onClose={() => setIsSidebarOpen(false)}
            canManage={canManage}
            onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
            tripCode={tripCode}
          />
        </div>

        <main className="flex-grow overflow-y-auto pb-16">
          {mainView === 'itinerary' && (
            <>
              {selectedView === 'trip-info' ? (
                <TripInfoView
                  transportations={transportations}
                  accommodations={allAccommodations}
                  currentUser={currentUser}
                  canManage={canManage}
                  onAddTransport={() => handleOpenTransportModal()}
                  onEditTransport={handleOpenTransportModal}
                  onDeleteTransport={handleDeleteTransportation}
                  onOpenChecklist={handleOpenChecklistModal}
                  onAddAccommodation={() => handleOpenModal(undefined, ItineraryItemType.Accommodation)}
                  onEditAccommodation={(item) => handleOpenModal(item)}
                  onDeleteAccommodation={handleDeleteItem}
                  onAddComment={handleAddComment}
                  onVote={handleVote}
                  onSaveAsTemplate={handleSaveAsTemplate}
                  onToggleVoteClosed={handleToggleVoteClosed}
                  onSelectAccommodation={setSelectedItemId}
                />
              ) : selectedItem ? (
                <ItineraryDetailView
                  item={selectedItem}
                  currentUser={currentUser}
                  onBack={() => setSelectedItemId(null)}
                  onAddComment={handleAddComment}
                  onVote={handleVote}
                  onEdit={() => handleOpenModal(selectedItem)}
                  onDelete={async (itemId) => {
                    if (await handleDeleteItem(itemId)) {
                      setSelectedItemId(null);
                    }
                  }}
                  canEdit={canManage}
                  onSaveAsTemplate={handleSaveAsTemplate}
                  onToggleVoteClosed={handleToggleVoteClosed}
                />
              ) : (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
                  <AnnouncementPanel
                    announcements={announcements}
                    currentUser={currentUser}
                    onPostAnnouncement={handlePostAnnouncement}
                    onUpdateAnnouncement={handleUpdateAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                  />
                  <ItineraryView
                    key={selectedDay}
                    day={selectedDay}
                    items={itemsForSelectedDay}
                    startDate={startDate}
                    currentUser={currentUser}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    onAddComment={handleAddComment}
                    onVote={handleVote}
                    onSelectItem={setSelectedItemId}
                    onOpenModal={handleOpenModal}
                    onSaveAsTemplate={handleSaveAsTemplate}
                    onToggleVoteClosed={handleToggleVoteClosed}
                  />
                </div>
              )}
            </>
          )}
          {mainView === 'ai-guide' && <AIGuideView />}
          {mainView === 'social' &&
            <SocialView
              posts={socialPosts}
              currentUser={currentUser}
              onOpenCreateModal={handleOpenCreatePostModal}
              onDeletePost={handleDeletePost}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddSocialComment}
              expenses={expenses}
              allUsers={expenseUsers}
              onOpenAddExpenseModal={handleOpenAddExpenseModal}
              onDeleteExpense={handleDeleteExpense}
              discussionThreads={discussionThreads}
              onAddThread={handleAddThread}
              onAddReply={handleAddReply}
            />
          }
          {mainView === 'settings' && <SettingsView />}
        </main>
      </div>
      {isModalOpen && (
        <ItineraryItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
          item={editingItem}
          day={editingItem?.day ?? (typeof selectedView === 'number' ? selectedView : 1)}
          totalDays={totalDays}
          forcedType={forcedType}
          templates={templates}
          canManage={canManage}
        />
      )}
      {isTemplatesModalOpen && (
        <TemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          templates={templates}
          onCreate={handleCreateTemplate}
          onUpdate={handleUpdateTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}
      {isTransportModalOpen && (
        <TransportModal
          isOpen={isTransportModalOpen}
          onClose={() => setIsTransportModalOpen(false)}
          onSave={(transport) => {
            handleUpdateTransportation(transport);
            setIsTransportModalOpen(false);
          }}
          transport={editingTransport}
          currentUser={currentUser}
          canManage={canManage}
        />
      )}
      {isChecklistModalOpen && (
        <ChecklistModal
          isOpen={isChecklistModalOpen}
          onClose={() => setIsChecklistModalOpen(false)}
          onSave={(checklist) => {
            handleUpdateChecklist(checklist);
            setIsChecklistModalOpen(false);
          }}
          checklist={currentChecklist}
          currentUser={currentUser}
          title="檢查表"
        />
      )}
      {isTripCodeModalOpen && (
        <TripCodeModal
          isOpen={isTripCodeModalOpen}
          onSave={handleSetTripCode}
        />
      )}
      {isCreatePostModalOpen && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={handleCloseCreatePostModal}
          onSave={handleSavePost}
          post={editingPost}
        />
      )}
      {isAddExpenseModalOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseModalOpen}
          onClose={handleCloseAddExpenseModal}
          onSave={handleSaveExpense}
          expense={editingExpense}
          currentUser={currentUser}
          allUsers={expenseUsers}
          availableCurrencies={availableCurrencies}
          onUpdateCurrencies={setAvailableCurrencies}
        />
      )}
      <BottomNavBar activeView={mainView} onSelectView={handleSelectMainView} currentUser={currentUser} />
    </div>
  );
};

export default App;
