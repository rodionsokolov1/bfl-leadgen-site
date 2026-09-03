CREATE TABLE IF NOT EXISTS funnel_sessions (
  id BIGSERIAL PRIMARY KEY,
  tracking_id VARCHAR(64) NOT NULL UNIQUE,
  client_id VARCHAR(64),
  yclid TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_variant TEXT,
  segment TEXT NOT NULL,
  funnel_data JSONB NOT NULL,
  funnel_completed_at TIMESTAMPTZ NOT NULL,
  telegram_user_id BIGINT,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  telegram_started_at TIMESTAMPTZ,
  metrika_conversion_sent BOOLEAN NOT NULL DEFAULT FALSE,
  metrika_conversion_sent_at TIMESTAMPTZ,
  metrika_conversion_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS funnel_sessions_client_id_idx ON funnel_sessions (client_id);
CREATE INDEX IF NOT EXISTS funnel_sessions_yclid_idx ON funnel_sessions (yclid);
CREATE INDEX IF NOT EXISTS funnel_sessions_telegram_user_id_idx ON funnel_sessions (telegram_user_id);
CREATE INDEX IF NOT EXISTS funnel_sessions_conversion_pending_idx
  ON funnel_sessions (metrika_conversion_sent, metrika_conversion_claimed_at)
  WHERE metrika_conversion_sent = FALSE;
