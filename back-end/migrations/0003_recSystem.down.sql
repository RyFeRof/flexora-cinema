ALTER TABLE user_events DROP CONSTRAINT IF EXISTS user_events_event_type_check;
ALTER TABLE user_events ADD CONSTRAINT user_events_event_type_check
    CHECK (event_type IN ('view', 'like', 'watch_complete', 'search_click', 'click', 'view_trailer'));

DROP INDEX IF EXISTS uq_user_recomendations_global;

ALTER TABLE user_recomendations ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE Releases ALTER COLUMN dateCreate SET DEFAULT NOW();

ALTER TABLE Films DROP COLUMN IF EXISTS premiere_date;