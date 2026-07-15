ALTER TABLE Films ADD COLUMN IF NOT EXISTS premiere_date DATE NOT NULL DEFAULT NOW();

ALTER TABLE Releases ALTER COLUMN dateCreate DROP DEFAULT;

ALTER TABLE user_recomendations ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_recomendations_global
    ON user_recomendations (shelf_id, movie_id, source_entity_id, source_entity_type)
    WHERE user_id IS NULL;

ALTER TABLE user_events DROP CONSTRAINT IF EXISTS user_events_event_type_check;
ALTER TABLE user_events ADD CONSTRAINT user_events_event_type_check
    CHECK (event_type IN ('view', 'like', 'watch_complete', 'search_click', 'click', 'view_trailer', 'onboarding_genre'));