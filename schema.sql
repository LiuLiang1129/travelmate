CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  avatarUrl TEXT,
  trip_id TEXT
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  startDate TEXT,
  endDate TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS itinerary_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
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

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  author TEXT, -- JSON object (User)
  text TEXT,
  timestamp TEXT,
  readBy TEXT, -- JSON array of user IDs
  imageUrl TEXT
);

CREATE TABLE IF NOT EXISTS transportations (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  title TEXT,
  segments TEXT, -- JSON array
  checkInTime TEXT,
  reminders TEXT, -- JSON array
  checklist TEXT -- JSON array
);

CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
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

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
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

CREATE TABLE IF NOT EXISTS discussion_threads (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  title TEXT,
  topic TEXT,
  content TEXT,
  imageUrl TEXT,
  author TEXT, -- JSON object
  timestamp TEXT,
  replies TEXT, -- JSON array
  lastActivity TEXT
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  duration TEXT,
  description TEXT,
  location TEXT
);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  code TEXT UNIQUE,
  permission TEXT,
  created_at TEXT,
  expires_at TEXT
);
