import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import ItineraryView from './ItineraryView';
import ItineraryDetailView from './ItineraryDetailView';
import AnnouncementPanel from './AnnouncementPanel';
import Sidebar from './Sidebar';
import { User, UserRole, ItineraryItem, Announcement, Comment, ItineraryItemType, ItineraryTemplate, Vote, ChecklistItem, SocialPost, SocialComment, Expense, ExpenseParticipant, DiscussionThread, DiscussionReply, TransportationEvent, Trip } from '../types';
import { MOCK_TEMPLATES, ALL_USERS } from '../constants';
import ItineraryItemModal from './ItineraryItemModal';
import TemplatesModal from './TemplatesModal';
import TripInfoView from './TripInfoView';
import ChecklistModal from './ChecklistModal';
import TripCodeModal from './TripCodeModal';
import BottomNavBar, { MainView } from './BottomNavBar';
import AIGuideView from './AIGuideView';
import SocialView from './SocialView';
import SettingsView from './SettingsView';
import CreatePostModal from './CreatePostModal';
import AddExpenseModal from './AddExpenseModal';
import TransportModal from './TransportModal';

type ModalVotePayload = {
    question: string;
    options: { id: string; text: string }[];
} | null;

import { useTrip } from '../hooks/useTrip';

const TripDashboard: React.FC = () => {

    // ... (inside TripDashboard)
    const { tripCode } = useParams<{ tripCode: string }>();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // const [currentTrip, setCurrentTrip] = useState<Trip | null>(null); // Replaced by hook
    const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [startDate, setStartDate] = useState(new Date());
    const [totalDays, setTotalDays] = useState(3);
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
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

    // Expense State
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['JPY', 'TWD', 'USD']);

    // Discussion Forum State
    const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>([]);

    // Template State
    const [templates, setTemplates] = useState<ItineraryTemplate[]>(MOCK_TEMPLATES);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
    const [forcedType, setForcedType] = useState<ItineraryItemType | null>(null);

    // Trip Code State (Local override if needed, but mainly from URL)
    const [isTripCodeModalOpen, setIsTripCodeModalOpen] = useState(false);

    // Cloud Save State
    const [isSaving, setIsSaving] = useState(false);

    // --- SWR Integration ---
    const { trip: currentTrip, tripData, isLoading, isError, mutate } = useTrip(tripCode);

    // Initialize User from LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('travel_mate_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('travel_mate_user');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    // Handle Trip Data Sync
    useEffect(() => {
        if (currentTrip) {
            setStartDate(new Date(currentTrip.startDate));
            const start = new Date(currentTrip.startDate);
            const end = new Date(currentTrip.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTotalDays(diffDays || 3);
        }
    }, [currentTrip]);

    useEffect(() => {
        if (tripData) {
            // Only update if we're not currently editing something? 
            // For now, simpler sync: Server Wins.
            // Ideally we check if local state is "dirty", but that's complex.
            // We will trust the polling interval to keep us up to date.
            if (tripData.itinerary) {
                setItinerary(tripData.itinerary);
                if (tripData.itinerary.length > 0) {
                    const maxDay = Math.max(...tripData.itinerary.map((item: any) => item.day), 1);
                    setTotalDays(prev => Math.max(prev, maxDay));
                }
            }
            if (tripData.announcements) setAnnouncements(tripData.announcements);
            if (tripData.transportations) setTransportations(tripData.transportations);
            if (tripData.socialPosts) setSocialPosts(tripData.socialPosts);
            if (tripData.expenses) setExpenses(tripData.expenses);
            if (tripData.discussionThreads) setDiscussionThreads(tripData.discussionThreads);
            // Templates are usually local or separate, but if we synced them:
            if (tripData.templates) setTemplates(tripData.templates);
        }
    }, [tripData]);

    if (isError) {
        // handle error, maybe redirect or show alert
        // console.error("Error loading trip", isError);
    }



    const canManage = currentUser ? (currentUser.role === UserRole.TourLeader || currentUser.role === UserRole.Planner || currentUser.role === UserRole.Admin) : false;

    const expenseUsers = useMemo(() =>
        ALL_USERS.filter(user =>
            user.role !== UserRole.Planner && user.role !== UserRole.Admin
        ),
        []);

    const selectedDay = typeof selectedView === 'number' ? selectedView : 1;
    const selectedItem = useMemo(() => itinerary.find(item => item.id === selectedItemId) || null, [selectedItemId, itinerary]);
    const allAccommodations = useMemo(() => itinerary.filter(item => item.type === ItineraryItemType.Accommodation).sort((a, b) => a.day - b.day), [itinerary]);


    const handleUpdateItem = useCallback((updatedItem: ItineraryItem) => {
        setItinerary(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const handleAddItem = useCallback((newItem: Omit<ItineraryItem, 'id'>) => {
        const fullNewItem: ItineraryItem = {
            ...newItem,
            id: `item-${Date.now()}`
        };
        setItinerary(prev => [...prev, fullNewItem].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)));
    }, []);

    const handleDeleteItem = useCallback((itemId: string): boolean => {
        if (window.confirm('確定要刪除此項目嗎？')) {
            setItinerary(prev => prev.filter(item => item.id !== itemId));
            return true;
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
        if (!currentUser || !currentTrip) return;
        // Announcements still use the old "Save Trip" flow or could be granular too. 
        // For now, keeping as local state change + save trip, OR update to granular if desired.
        // But user asked for "Social Class" 3 items: Discussion, Expenses, Travel Logs.
        // Announcements is separate. Keeping as is.
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            author: currentUser,
            text,
            timestamp: new Date().toISOString(),
            readBy: [currentUser.id],
            imageUrl,
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    }, [currentUser, currentTrip]);
    const handleUpdateAnnouncement = useCallback((updatedAnnouncement: Announcement) => {
        setAnnouncements(prev => prev.map(ann => ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann));
    }, []);

    const handleDeleteAnnouncement = useCallback((announcementId: string) => {
        if (window.confirm('確定要刪除這則公告嗎？')) {
            setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
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
    const handleUpdateTransportation = useCallback((updatedTransport: TransportationEvent) => {
        setTransportations(prev => {
            const exists = prev.some(t => t.id === updatedTransport.id);
            if (exists) {
                return prev.map(t => t.id === updatedTransport.id ? updatedTransport : t);
            }
            return [...prev, updatedTransport].sort((a, b) => new Date(a.segments[0].departureDateTime).getTime() - new Date(b.segments[0].departureDateTime).getTime());
        });
    }, []);

    const handleDeleteTransportation = useCallback((id: string) => {
        if (window.confirm("確定要刪除這筆交通安排嗎？")) {
            setTransportations(prev => prev.filter(t => t.id !== id));
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
                // Logic to preserve voters if options match
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

    const handleOpenCreatePostModal = useCallback((postToEdit?: SocialPost) => {
        setEditingPost(postToEdit || null);
        setIsCreatePostModalOpen(true);
    }, []);

    const handleCloseCreatePostModal = useCallback(() => {
        setIsCreatePostModalOpen(false);
        setEditingPost(null);
    }, []);

    const handleOpenAddExpenseModal = useCallback((expenseToEdit?: Expense) => {
        setEditingExpense(expenseToEdit || null);
        setIsAddExpenseModalOpen(true);
    }, []);

    const handleCloseAddExpenseModal = useCallback(() => {
        setIsAddExpenseModalOpen(false);
        setEditingExpense(null);
    }, []);

    // Social Post Handlers (Refactored)
    const handleSavePost = useCallback(async (postData: Omit<SocialPost, 'id' | 'author' | 'timestamp' | 'comments' | 'likes'>) => {
        if (!currentUser || !currentTrip) return;

        try {
            let res;
            if (editingPost) {
                // Update
                res = await fetch(`/api/social-posts/${editingPost.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingPost, ...postData })
                });
            } else {
                // Create
                const newPost: Partial<SocialPost> = {
                    tripId: currentTrip.id,
                    author: currentUser,
                    timestamp: new Date().toISOString(),
                    comments: [],
                    likes: [],
                    ...postData,
                };
                res = await fetch('/api/social-posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPost)
                });
            }

            if (!res.ok) throw new Error("Failed to save post");
            mutate(); // Refresh data
            handleCloseCreatePostModal();
        } catch (error) {
            console.error("Error saving post:", error);
            alert("儲存遊記失敗");
        }
    }, [currentUser, currentTrip, editingPost, handleCloseCreatePostModal, mutate]);

    const handleDeletePost = useCallback(async (postId: string) => {
        if (!window.confirm('確定要刪除這篇遊記嗎？')) return;
        try {
            const res = await fetch(`/api/social-posts/${postId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete post");
            mutate();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("刪除遊記失敗");
        }
    }, [mutate]);

    const handleToggleLike = useCallback(async (postId: string) => {
        if (!currentUser) return;
        const post = socialPosts.find(p => p.id === postId);
        if (!post) return;

        const hasLiked = post.likes.includes(currentUser.id);
        const newLikes = hasLiked
            ? post.likes.filter(uid => uid !== currentUser.id)
            : [...post.likes, currentUser.id];

        // Optimistic update (optional, but good for UX)
        setSocialPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));

        try {
            await fetch(`/api/social-posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...post, likes: newLikes })
            });
            mutate();
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    }, [currentUser, socialPosts, mutate]);

    const handleAddSocialComment = useCallback(async (postId: string, text: string) => {
        if (!currentUser) return;
        const post = socialPosts.find(p => p.id === postId);
        if (!post) return;

        const newComment: SocialComment = {
            id: `sc-${Date.now()}`,
            author: currentUser,
            text,
            timestamp: new Date().toISOString(),
        };
        const newComments = [...post.comments, newComment];

        try {
            await fetch(`/api/social-posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...post, comments: newComments })
            });
            mutate();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }, [currentUser, socialPosts, mutate]);

    // Expense Handlers (Refactored)
    const handleSaveExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
        if (!currentTrip) return;
        try {
            let res;
            if (editingExpense) {
                res = await fetch(`/api/expenses/${editingExpense.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingExpense, ...expenseData })
                });
            } else {
                const newExpense: Partial<Expense> = {
                    ...expenseData,
                    tripId: currentTrip.id,
                };
                res = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newExpense)
                });
            }
            if (!res.ok) throw new Error("Failed to save expense");
            mutate();
            handleCloseAddExpenseModal();
        } catch (error) {
            console.error("Error saving expense:", error);
            alert("儲存帳目失敗");
        }
    }, [currentTrip, editingExpense, handleCloseAddExpenseModal, mutate]);

    const handleDeleteExpense = useCallback(async (expenseId: string) => {
        if (!window.confirm('確定要刪除這筆帳目嗎？')) return;
        try {
            const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete expense");
            mutate();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("刪除帳目失敗");
        }
    }, [mutate]);

    // Discussion Forum Handlers (Refactored)
    const handleAddThread = useCallback(async (threadData: Omit<DiscussionThread, 'id' | 'author' | 'timestamp' | 'replies' | 'lastActivity'>) => {
        if (!currentUser || !currentTrip) return;
        const now = new Date().toISOString();
        const newThread = {
            ...threadData,
            tripId: currentTrip.id,
            author: currentUser,
            timestamp: now,
            replies: [],
            lastActivity: now,
        };

        try {
            const res = await fetch('/api/discussion-threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newThread)
            });
            if (!res.ok) throw new Error("Failed to create thread");
            mutate();
        } catch (error) {
            console.error("Error creating thread:", error);
            alert("新增討論失敗");
        }
    }, [currentUser, currentTrip, mutate]);

    const handleAddReply = useCallback(async (threadId: string, content: string) => {
        if (!currentUser) return;
        const thread = discussionThreads.find(t => t.id === threadId);
        if (!thread) return;

        const now = new Date().toISOString();
        const newReply: DiscussionReply = {
            id: `reply-${Date.now()}`,
            author: currentUser,
            content,
            timestamp: now,
        };
        const newReplies = [...thread.replies, newReply];

        try {
            await fetch(`/api/discussion-threads/${threadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replies: newReplies, lastActivity: now })
            });
            mutate();
        } catch (error) {
            console.error("Error adding reply:", error);
            alert("回覆失敗");
        }
    }, [currentUser, discussionThreads, mutate]);


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

    // Save (Cloud D1) and Load (File) Logic
    const handleSaveTrip = useCallback(async () => {
        if (!currentTrip) {
            alert("請先建立或加入一個行程");
            return;
        }
        setIsSaving(true);
        const data = {
            tripId: currentTrip.id,
            itinerary,
            announcements,
            transportations,
            socialPosts,
            expenses,
            discussionThreads,
        };

        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            console.log("Saved to Cloudflare D1...", data);
            alert(`行程已成功儲存至 Cloudflare D1 資料庫！\n(代碼: ${tripCode})`);

        } catch (error: any) {
            console.error("Save failed:", error);
            alert(`儲存至雲端失敗：${error.message}`);
        } finally {
            setIsSaving(false);
            mutate(); // Trigger revalidation
        }
    }, [currentTrip, itinerary, announcements, transportations, socialPosts, expenses, discussionThreads, tripCode, mutate]);

    const handleLoadTrip = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    const data = JSON.parse(result);

                    if (data.itinerary) setItinerary(data.itinerary);
                    if (data.announcements) setAnnouncements(data.announcements);
                    if (data.startDate) setStartDate(new Date(data.startDate));
                    if (data.totalDays) setTotalDays(data.totalDays);
                    if (data.transportations) setTransportations(data.transportations);
                    if (data.socialPosts) setSocialPosts(data.socialPosts);
                    if (data.expenses) setExpenses(data.expenses);
                    if (data.discussionThreads) setDiscussionThreads(data.discussionThreads);
                    if (data.templates) setTemplates(data.templates);
                    // if (data.tripCode) setTripCode(data.tripCode); // Don't override URL trip code

                    alert('行程讀取成功！');
                    setSelectedView('trip-info');
                }
            } catch (err) {
                console.error(err);
                alert('讀取檔案失敗，請確認檔案格式正確。');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    }, []);

    if (!currentUser || !currentTrip) {
        // Loading state or redirecting handled by useEffect
        return <div className="h-screen flex items-center justify-center">載入中...</div>;
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
                        tripCode={tripCode || ''}
                        onSaveTrip={handleSaveTrip}
                        onLoadTrip={handleLoadTrip}
                        isSaving={isSaving}
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
                                    onDelete={(itemId) => {
                                        if (handleDeleteItem(itemId)) {
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
                    onSave={(code) => { /* No-op or redirect? */ }}
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

export default TripDashboard;
