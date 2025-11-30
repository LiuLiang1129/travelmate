DROP TABLE IF EXISTS entries;
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
INSERT INTO entries (content) VALUES ('Hello from D1!');
