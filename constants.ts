
import { User, UserRole, ItineraryItem, ItineraryItemType, Announcement, ItineraryTemplate, TransportationEvent, SocialPost, Expense, ExpenseCategory, DiscussionThread, ExpenseSplitMethod } from './types';

export const MOCK_USERS: Record<UserRole, User> = {
  [UserRole.Traveler]: { id: 'user-1', name: '亞歷克斯', role: UserRole.Traveler, avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
  [UserRole.TourLeader]: { id: 'user-2', name: '布蘭達 (領隊)', role: UserRole.TourLeader, avatarUrl: 'https://i.pravatar.cc/150?u=brenda' },
  [UserRole.Planner]: { id: 'user-3', name: '查爾斯 (規劃員)', role: UserRole.Planner, avatarUrl: 'https://i.pravatar.cc/150?u=charles' },
  [UserRole.Admin]: { id: 'user-4', name: '黛安娜 (管理員)', role: UserRole.Admin, avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
};

const traveler1 = MOCK_USERS[UserRole.Traveler];
const tourLeader = MOCK_USERS[UserRole.TourLeader];
const planner = MOCK_USERS[UserRole.Planner];
const admin = MOCK_USERS[UserRole.Admin];
const traveler2 = { id: 'user-5', name: '伊森', role: UserRole.Traveler, avatarUrl: 'https://i.pravatar.cc/150?u=ethan' };
const traveler3 = { id: 'user-6', name: '費歐娜', role: UserRole.Traveler, avatarUrl: 'https://i.pravatar.cc/150?u=fiona' };

export const ALL_USERS: User[] = [
    traveler1, tourLeader, planner, admin, traveler2, traveler3
];

export const MOCK_TRANSPORTATIONS: TransportationEvent[] = [
  {
    id: 'trans-dep-1',
    title: '去程：前往大阪',
    checkInTime: '建議於起飛前 3 小時抵達',
    segments: [
      {
        id: 'seg-dep-1',
        departureDateTime: '2024-10-26T08:30:00Z',
        arrivalDateTime: '2024-10-26T12:30:00Z',
        origin: '台北桃園國際機場 (TPE)',
        destination: '關西國際機場 (KIX)',
        transportMode: '飛行',
        transportDetails: {
          number: 'BR-132',
          terminalOrPlatform: '第 2 航廈',
          notes: '座位: 24A',
        },
      }
    ],
    reminders: [
      '航班起飛前 3 小時抵達機場。',
      '手提行李每人限一件，不超過 7 公斤。',
      '檢查護照效期是否超過 6 個月。',
    ],
    checklist: [
      { id: 'check-1', text: '護照與簽證', isChecked: true },
      { id: 'check-2', text: '機票/電子登機證', isChecked: false },
      { id: 'check-3', text: '換洗衣物', isChecked: false },
      { id: 'check-4', text: '個人藥品', isChecked: false },
      { id: 'check-5', text: '充電器與行動電源', isChecked: false },
    ],
  },
  {
    id: 'trans-mid-1',
    title: '移動：京都前往東京',
    checkInTime: '請於發車前 20 分鐘抵達月台',
    segments: [
        {
            id: 'seg-mid-1',
            departureDateTime: '2024-10-29T10:00:00Z',
            arrivalDateTime: '2024-10-29T12:15:00Z',
            origin: '京都車站',
            destination: '東京車站',
            transportMode: '火車',
            transportDetails: {
                number: 'Nozomi 22',
                terminalOrPlatform: '14號月台',
                notes: '指定席 8車 5A/5B'
            }
        }
    ],
    reminders: [
        '新幹線準時發車，請勿遲到',
        '可以在車站購買鐵路便當'
    ],
    checklist: [
        { id: 'check-mid-1', text: '新幹線車票', isChecked: false },
        { id: 'check-mid-2', text: '隨身行李確認', isChecked: false }
    ]
  },
  {
    id: 'trans-ret-1',
    title: '返程：返回台北',
    checkInTime: '建議於起飛前 3 小時抵達',
    segments: [
      {
        id: 'seg-ret-1',
        departureDateTime: '2024-10-30T14:00:00Z',
        arrivalDateTime: '2024-10-30T18:00:00Z',
        origin: '成田國際機場 (NRT)',
        destination: '台北桃園國際機場 (TPE)',
        transportMode: '飛行',
        transportDetails: {
          number: 'BR-197',
          terminalOrPlatform: '第 1 航廈',
          notes: '座位: 30C',
        },
      }
    ],
    reminders: [
      '記得購買伴手禮！',
      '檢查行李是否超重。',
      '確認退稅手續已完成。',
    ],
    checklist: [
      { id: 'check-ret-1', text: '護照與登機證', isChecked: false },
      { id: 'check-ret-2', text: '托運行李', isChecked: false },
      { id: 'check-ret-3', text: '確認手機電量', isChecked: false },
    ],
  }
];

export const MOCK_ITINERARY: ItineraryItem[] = [
  {
    id: 'item-1',
    day: 1,
    endDay: 3, // Stay for nights of Day 1 and Day 2, checkout on Day 3 morning
    type: ItineraryItemType.Accommodation,
    title: '入住：京都格蘭大酒店',
    time: '15:00',
    duration: '1 小時',
    description: '抵達飯店，辦理入住手續，安頓下來。飯店位於市中心，可輕鬆前往主要景點。',
    location: '京都, 下京區',
    imageUrl: 'https://picsum.photos/seed/hotel/800/400',
    comments: [
      { id: 'c1', author: MOCK_USERS[UserRole.Traveler], text: '太興奮了！', timestamp: '2024-07-28T10:00:00Z' },
    ],
    vote: null,
  },
  {
    id: 'item-2',
    day: 1,
    type: ItineraryItemType.Dining,
    title: '祇園 Kappa 歡迎晚宴',
    time: '19:00',
    duration: '2 小時',
    description: '一場傳統的懷石料理晚宴，為我們的旅程拉開序幕。如有任何飲食限制，請提前告知。',
    location: '京都, 祇園',
    imageUrl: 'https://picsum.photos/seed/dinner/800/400',
    comments: [],
    vote: {
      id: 'v1',
      question: '我們的主菜主題應該是什麼？',
      options: [
        { id: 'vo1', text: '壽司拼盤', voters: ['user-1'] },
        { id: 'vo2', text: '和牛', voters: [] },
        { id: 'vo3', text: '蔬菜天婦羅', voters: [] },
      ]
    }
  },
  {
    id: 'item-3',
    day: 2,
    type: ItineraryItemType.Attraction,
    title: '參觀金閣寺',
    time: '09:00',
    duration: '2 小時',
    description: '探索這座令人驚嘆的禪宗佛教寺廟，其頂部兩層完全覆蓋著金箔，因而聞名。',
    location: '京都, 北區',
    imageUrl: 'https://picsum.photos/seed/temple/800/400',
    comments: [],
    vote: null,
  },
  {
    id: 'item-4',
    day: 2,
    type: ItineraryItemType.Activity,
    title: '嵐山竹林小徑漫步',
    time: '11:30',
    duration: '1.5 小時',
    description: '在日本最著名的竹林之一中寧靜地漫步。這條小徑長約 500 公尺，提供獨特而平靜的體驗。',
    location: '京都, 嵐山',
    imageUrl: 'https://picsum.photos/seed/bamboo/800/400',
    comments: [
      { id: 'c2', author: MOCK_USERS[UserRole.Traveler], text: '我應該為此帶上我的好相機嗎？', timestamp: '2024-07-28T12:00:00Z' },
      { id: 'c3', author: MOCK_USERS[UserRole.TourLeader], text: '當然！這裡非常上相。', timestamp: '2024-07-28T12:05:00Z' },
    ],
    vote: null,
  },
  {
    id: 'item-5',
    day: 2,
    type: ItineraryItemType.Dining,
    title: '嵐山附近午餐',
    time: '13:00',
    description: '我們有幾個午餐選擇。讓我們決定去哪裡。',
    location: '京都, 嵐山',
    imageUrl: 'https://picsum.photos/seed/lunch/800/400',
    comments: [],
    vote: {
      id: 'v2',
      question: '我們應該在哪裡吃午餐？',
      options: [
        { id: 'vo4', text: '傳統蕎麥麵', voters: ['user-1'] },
        { id: 'vo5', text: '河畔餐廳', voters: [] },
        { id: 'vo6', text: '從當地市場外帶', voters: [] },
      ]
    },
  },
  {
    id: 'item-6',
    day: 3,
    type: ItineraryItemType.Transportation,
    title: '搭乘新幹線前往東京',
    time: '10:00',
    duration: '2.5 小時',
    description: '搭乘高速新幹線（子彈列車）從京都前往東京。享受舒適的旅程和沿途的風景。',
    location: '京都站 -> 東京站',
    imageUrl: 'https://picsum.photos/seed/train/800/400',
    comments: [],
    vote: null,
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    author: MOCK_USERS[UserRole.TourLeader],
    text: '歡迎大家！請務必查看第一天的行程。我們將於 18:45 在飯店大廳集合享用晚餐。',
    timestamp: '2024-07-28T09:00:00Z',
    readBy: ['user-1', 'user-2'],
    imageUrl: 'https://picsum.photos/seed/welcome/800/200',
  },
  {
    id: 'ann-2',
    author: MOCK_USERS[UserRole.TourLeader],
    text: '第二天提醒：請穿著舒適的步行鞋。我們將會走很多路！',
    timestamp: '2024-07-27T18:00:00Z',
    readBy: ['user-2'],
  }
];

export const MOCK_TEMPLATES: ItineraryTemplate[] = [
  {
    id: 'template-1',
    title: '城市徒步導覽',
    type: ItineraryItemType.Activity,
    duration: '3 小時',
    description: '跟隨當地導遊，探索城市的隱藏寶石和歷史地標。準備好大量步行！',
    location: '市中心集合點',
  },
  {
    id: 'template-2',
    title: '米其林星級晚餐',
    type: ItineraryItemType.Dining,
    duration: '2.5 小時',
    description: '在一家著名的米其林星級餐廳享受精緻的用餐體驗。需要提前預訂。',
    location: '待定',
  }
];

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp-1',
    author: MOCK_USERS[UserRole.Traveler],
    timestamp: '2024-10-26T14:30:00Z',
    title: '嵐山竹林初體驗',
    text: '剛剛在嵐山竹林！空氣好清新，感覺超級療癒！🎋',
    mediaUrl: 'https://picsum.photos/seed/social-bamboo/800/600',
    mediaType: 'image',
    comments: [
      { id: 'sc-1', author: MOCK_USERS[UserRole.TourLeader], text: '拍得真美！很高興你喜歡這裡。', timestamp: '2024-10-26T14:35:00Z' },
    ],
    likes: ['user-2'],
    isPublic: true,
  },
  {
    id: 'sp-2',
    author: MOCK_USERS[UserRole.TourLeader],
    timestamp: '2024-10-27T10:15:00Z',
    title: '金光閃閃的金閣寺',
    text: '金閣寺真的名不虛傳，金光閃閃的✨\n#京都 #金閣寺 #必去景點',
    mediaUrl: 'https://picsum.photos/seed/social-temple/800/800',
    mediaType: 'image',
    comments: [],
    likes: ['user-1', 'user-4'],
    isPublic: true,
  },
  {
    id: 'sp-3',
    author: traveler2,
    timestamp: '2024-10-27T19:00:00Z',
    title: '藝術品般的懷石料理',
    text: '晚餐的懷石料理，每一道都像藝術品，捨不得吃又好好吃！🍣',
    mediaUrl: 'https://picsum.photos/seed/social-food/800/500',
    mediaType: 'image',
    comments: [],
    likes: [],
    isPublic: false,
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: '拉麵晚餐',
    amount: 4500,
    currency: 'JPY',
    payerId: tourLeader.id, // Brenda paid
    participants: [
      { userId: traveler1.id, share: 900 }, // Alex
      { userId: tourLeader.id, share: 900 }, // Brenda
      { userId: traveler2.id, share: 900 }, // Ethan
      { userId: traveler3.id, share: 900 }, // Fiona
      { userId: admin.id, share: 900 }, // Diana
    ],
    date: '2024-10-26',
    category: ExpenseCategory.Dining,
    splitMethod: ExpenseSplitMethod.Equal,
    authorId: tourLeader.id,
  },
  {
    id: 'exp-2',
    description: '金閣寺門票',
    amount: 2000,
    currency: 'JPY',
    payerId: traveler1.id, // Alex paid
    participants: [
      { userId: traveler1.id, share: 500 },
      { userId: tourLeader.id, share: 500 },
      { userId: traveler2.id, share: 500 },
      { userId: traveler3.id, share: 500 },
    ],
    date: '2024-10-27',
    category: ExpenseCategory.Tickets,
    splitMethod: ExpenseSplitMethod.Equal,
    authorId: traveler1.id,
  },
  {
    id: 'exp-3',
    description: '計程車費用',
    amount: 3200,
    currency: 'JPY',
    payerId: traveler1.id, // Alex paid
    participants: [
      { userId: traveler1.id, share: 1600 },
      { userId: tourLeader.id, share: 1600 },
    ],
    date: '2024-10-27',
    category: ExpenseCategory.Transportation,
    splitMethod: ExpenseSplitMethod.Equal,
    authorId: traveler1.id,
  },
    {
    id: 'exp-4',
    description: '伴手禮',
    amount: 8000,
    currency: 'JPY',
    payerId: traveler2.id, // Ethan paid
    participants: [
      { userId: traveler2.id, share: 8000 }
    ],
    date: '2024-10-28',
    category: ExpenseCategory.Shopping,
    splitMethod: ExpenseSplitMethod.Equal,
    authorId: traveler2.id,
    notes: '幫家人買的，不用分帳',
  }
];

export const MOCK_DISCUSSION_THREADS: DiscussionThread[] = [
  {
    id: 'thread-1',
    title: '關於第一天晚餐的餐廳選擇',
    topic: '餐飲',
    content: '大家好，我想知道大家對第一天晚餐的懷石料理有什麼看法？有沒有人對特定食材過敏，或者有其他想推薦的餐廳？',
    imageUrl: 'https://picsum.photos/seed/discussion-food/800/400',
    author: traveler1,
    timestamp: '2024-10-25T10:00:00Z',
    replies: [
      {
        id: 'reply-1-1',
        author: tourLeader,
        content: '很好的問題！餐廳方面，祇園 Kappa 是評價很高的選擇。如果有人對海鮮過敏，請盡快告訴我，我們可以提前安排。',
        timestamp: '2024-10-25T11:30:00Z',
      },
      {
        id: 'reply-1-2',
        author: traveler2,
        content: '我對蝦蟹過敏，但魚類沒問題。',
        timestamp: '2024-10-25T12:15:00Z',
      },
    ],
    lastActivity: '2024-10-25T12:15:00Z',
  },
  {
    id: 'thread-2',
    title: '金閣寺附近還有什麼推薦的嗎？',
    topic: '景點',
    content: '第二天早上參觀完金閣寺後，我們有一點自由時間。附近有沒有值得一去的小店或咖啡廳？',
    author: traveler3,
    timestamp: '2024-10-26T09:00:00Z',
    replies: [],
    lastActivity: '2024-10-26T09:00:00Z',
  },
  {
    id: 'thread-3',
    title: '從關西機場到京都的交通',
    topic: '交通',
    content: '我們是搭 Haruka 特快列車嗎？票是已經買好了還是要到現場買？',
    author: traveler1,
    timestamp: '2024-10-24T14:00:00Z',
    replies: [
      {
        id: 'reply-3-1',
        author: tourLeader,
        content: '是的，我們會搭乘 Haruka。車票已經統一預訂好了，大家到時候在機場跟著我就行。',
        timestamp: '2024-10-24T14:05:00Z',
      },
    ],
    lastActivity: '2024-10-24T14:05:00Z',
  }
];
