DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  avatarUrl TEXT
);

DROP TABLE IF EXISTS itinerary_items;
CREATE TABLE itinerary_items (
  id TEXT PRIMARY KEY,
  day INTEGER,
  endDay INTEGER,
  type TEXT,
  title TEXT,
  time TEXT,
  duration TEXT,
  description TEXT,
  location TEXT,
  imageUrl TEXT,
  comments TEXT, -- JSON array
  vote TEXT -- JSON object
);

DROP TABLE IF EXISTS announcements;
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  author TEXT, -- JSON object (User)
  text TEXT,
  timestamp TEXT,
  readBy TEXT, -- JSON array of user IDs
  imageUrl TEXT
);

DROP TABLE IF EXISTS transportations;
CREATE TABLE transportations (
  id TEXT PRIMARY KEY,
  title TEXT,
  segments TEXT, -- JSON array
  checkInTime TEXT,
  reminders TEXT, -- JSON array
  checklist TEXT -- JSON array
);

DROP TABLE IF EXISTS social_posts;
CREATE TABLE social_posts (
  id TEXT PRIMARY KEY,
  author TEXT, -- JSON object
  timestamp TEXT,
  title TEXT,
  text TEXT,
  mediaUrl TEXT,
  mediaType TEXT,
  comments TEXT, -- JSON array
  likes TEXT, -- JSON array
  isPublic BOOLEAN
);

DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  description TEXT,
  amount REAL,
  currency TEXT,
  payerId TEXT,
  participants TEXT, -- JSON array
  date TEXT,
  category TEXT,
  splitMethod TEXT,
  notes TEXT,
  authorId TEXT
);

DROP TABLE IF EXISTS discussion_threads;
CREATE TABLE discussion_threads (
  id TEXT PRIMARY KEY,
  title TEXT,
  topic TEXT,
  content TEXT,
  imageUrl TEXT,
  author TEXT, -- JSON object
  timestamp TEXT,
  replies TEXT, -- JSON array
  lastActivity TEXT
);

DROP TABLE IF EXISTS templates;
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  duration TEXT,
  description TEXT,
  location TEXT
);
