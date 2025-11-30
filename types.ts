
export enum UserRole {
  Traveler = '旅客',
  TourLeader = '領隊',
  Planner = '規劃員',
  Admin = '管理員',
}

export enum ItineraryItemType {
  Accommodation = '住宿',
  Transportation = '交通',
  Dining = '餐飲',
  Attraction = '景點',
  Activity = '活動',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface VoteOption {
  id:string;
  text: string;
  voters: string[]; // array of user ids
}

export interface Vote {
  id: string;
  question: string;
  options: VoteOption[];
  isClosed?: boolean;
}

export interface ItineraryItem {
  id: string;
  day: number;
  endDay?: number; // Checkout day for accommodation
  type: ItineraryItemType;
  title: string;
  time: string;
  duration?: string; // e.g. "3 hours"
  description: string;
  location?: string;
  imageUrl: string;
  comments: Comment[];
  vote: Vote | null;
}

export interface Announcement {
  id: string;
  author: User;
  text: string;
  timestamp: string;
  readBy: string[]; // array of user ids
  imageUrl?: string;
}

export interface ItineraryTemplate {
  id: string;
  title: string;
  type: ItineraryItemType;
  duration: string;
  description: string;
  location: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  authorId?: string; // ID of the user who added it, if it's a personal item
}

export interface TransportSegment {
  id: string;
  departureDateTime: string;
  arrivalDateTime?: string;
  origin: string;
  destination: string;
  transportMode: '飛行' | '火車' | '巴士' | '自行開車' | '船運' | '其他';
  transportDetails: {
    number: string; // Flight number, train number, etc.
    terminalOrPlatform: string;
    notes?: string;
  };
}

export interface TransportationEvent {
  id: string;
  title: string; // e.g., "去程班機", "移動至大阪", "返程"
  segments: TransportSegment[];
  checkInTime?: string;
  reminders: string[];
  checklist: ChecklistItem[];
}

export type DepartureInfo = TransportationEvent;
export type ReturnInfo = TransportationEvent;

export interface SocialComment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface SocialPost {
  id: string;
  author: User;
  timestamp: string;
  title: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  comments: SocialComment[];
  likes: string[]; // array of user ids
  isPublic: boolean;
}

export enum ExpenseCategory {
  Dining = '餐飲',
  Transportation = '交通',
  Tickets = '票券',
  Shopping = '購物',
  Accommodation = '住宿',
  Other = '其他',
}

export type Currency = string;

export enum ExpenseSplitMethod {
    Equal = 'equal',
    Custom = 'custom',
}


export interface ExpenseParticipant {
  userId: string;
  share: number; // The amount this user owes for this expense
}

export interface Expense {
  id:string;
  description: string;
  amount: number;
  currency: Currency;
  payerId: string;
  participants: ExpenseParticipant[];
  date: string; // ISO date string e.g., '2024-10-26'
  category: ExpenseCategory;
  splitMethod: ExpenseSplitMethod;
  notes?: string;
  authorId: string; // User who created the entry
}

export interface Settlement {
  from: User;
  to: User;
  amount: number;
}

export interface DiscussionReply {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  topic: string;
  content: string;
  imageUrl?: string;
  author: User;
  timestamp: string;
  replies: DiscussionReply[];
  lastActivity: string; // ISO string for sorting
}
