-- Run this entire file in the Supabase SQL Editor once to initialise the schema.

CREATE TABLE IF NOT EXISTS channel_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  snapshot_date DATE        NOT NULL,
  channel       TEXT        NOT NULL,
  campaign_id   TEXT,
  campaign_name TEXT,
  impressions   BIGINT,
  reach         BIGINT,
  clicks        BIGINT,
  spend         NUMERIC(14,2),
  cpl           NUMERIC(10,2),
  cpc           NUMERIC(10,2),
  ctr           NUMERIC(8,4),
  frequency     NUMERIC(8,4),
  leads         BIGINT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (snapshot_date, channel, campaign_id)
);

CREATE TABLE IF NOT EXISTS creative_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  snapshot_date DATE        NOT NULL,
  channel       TEXT        NOT NULL,
  campaign_id   TEXT,
  ad_id         TEXT,
  ad_name       TEXT,
  format        TEXT,
  thumbnail_url TEXT,
  headline      TEXT,
  cpl           NUMERIC(10,2),
  ctr           NUMERIC(8,4),
  frequency     NUMERIC(8,4),
  impressions   BIGINT,
  spend         NUMERIC(14,2),
  score         TEXT,
  score_reason  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (snapshot_date, channel, ad_id)
);

CREATE TABLE IF NOT EXISTS competitor_ads (
  id                       BIGSERIAL PRIMARY KEY,
  fetched_date             DATE        NOT NULL,
  competitor_name          TEXT        NOT NULL,
  ad_id                    TEXT        UNIQUE,
  page_name                TEXT,
  ad_creative_body         TEXT,
  ad_creative_link_title   TEXT,
  call_to_action_type      TEXT,
  ad_snapshot_url          TEXT,
  image_url                TEXT,
  video_url                TEXT,
  ad_delivery_start_time   TEXT,
  ad_delivery_stop_time    TEXT,
  estimated_run_days       INTEGER,
  impressions_lower        BIGINT,
  impressions_upper        BIGINT,
  spend_lower              NUMERIC(14,2),
  spend_upper              NUMERIC(14,2),
  dominant_format          TEXT,
  messaging_theme          TEXT,
  claude_analysis          TEXT,
  is_active                BOOLEAN     DEFAULT TRUE,
  first_seen               TIMESTAMPTZ DEFAULT NOW(),
  last_seen                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_intelligence (
  id                       BIGSERIAL PRIMARY KEY,
  report_date              DATE        UNIQUE NOT NULL,
  summary                  TEXT,
  top_insight              TEXT,
  creative_recommendation  TEXT,
  competitor_watch         TEXT,
  generated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_log (
  id                       BIGSERIAL PRIMARY KEY,
  refresh_date             DATE        NOT NULL,
  status                   TEXT,
  windsor_status           TEXT,
  meta_library_status      TEXT,
  claude_analysis_status   TEXT,
  records_updated          INTEGER,
  error_message            TEXT,
  duration_ms              INTEGER,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Session table for express-session (connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR   NOT NULL COLLATE "default",
  "sess"   JSON      NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
