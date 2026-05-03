CREATE TABLE IF NOT EXISTS channel_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  channel TEXT NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  impressions INTEGER,
  reach INTEGER,
  clicks INTEGER,
  spend REAL,
  cpl REAL,
  cpc REAL,
  ctr REAL,
  frequency REAL,
  leads INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS creative_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  channel TEXT NOT NULL,
  campaign_id TEXT,
  ad_id TEXT,
  ad_name TEXT,
  format TEXT,
  thumbnail_url TEXT,
  headline TEXT,
  cpl REAL,
  ctr REAL,
  frequency REAL,
  impressions INTEGER,
  spend REAL,
  score TEXT,
  score_reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competitor_ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fetched_date TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  ad_id TEXT UNIQUE,
  page_name TEXT,
  ad_creative_body TEXT,
  ad_creative_link_title TEXT,
  call_to_action_type TEXT,
  ad_snapshot_url TEXT,
  image_url TEXT,
  video_url TEXT,
  ad_delivery_start_time TEXT,
  ad_delivery_stop_time TEXT,
  estimated_run_days INTEGER,
  impressions_lower INTEGER,
  impressions_upper INTEGER,
  spend_lower REAL,
  spend_upper REAL,
  dominant_format TEXT,
  messaging_theme TEXT,
  claude_analysis TEXT,
  is_active INTEGER DEFAULT 1,
  first_seen TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_intelligence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date TEXT UNIQUE NOT NULL,
  summary TEXT,
  top_insight TEXT,
  creative_recommendation TEXT,
  competitor_watch TEXT,
  generated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  refresh_date TEXT NOT NULL,
  status TEXT,
  windsor_status TEXT,
  meta_library_status TEXT,
  claude_analysis_status TEXT,
  records_updated INTEGER,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
