

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE Films ADD COLUMN embedding vector(3072);

CREATE TABLE shelves (
    id   SERIAL PRIMARY KEY,
    type TEXT NOT NULL UNIQUE
);

CREATE TABLE user_recomendations (
    id                 SERIAL PRIMARY KEY,
    user_id            INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    shelf_id           INT NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
    movie_id           INT NOT NULL REFERENCES Films(id) ON DELETE CASCADE,
    source_entity_id   INT,
    source_entity_type TEXT CHECK (source_entity_type IN ('movie', 'genre', 'filming_member')),
    score              FLOAT NOT NULL,
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, shelf_id, movie_id, source_entity_id, source_entity_type)
);

CREATE TABLE user_events (
    id               SERIAL PRIMARY KEY,
    user_id          INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    event_type       TEXT NOT NULL CHECK (event_type IN ('view', 'like', 'watch_complete', 'search_click', 'click', 'view_trailer')),
    entity_id        INT NOT NULL,
    entity_type      TEXT NOT NULL CHECK (entity_type IN ('movie', 'filming_member', 'genre')),
    count            INT NOT NULL DEFAULT 1,
    last_occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, event_type, entity_id, entity_type)
);

CREATE TABLE user_factors (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL UNIQUE REFERENCES Users(id) ON DELETE CASCADE,
    factors    FLOAT[] NOT NULL,
    user_bias  FLOAT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE movie_factors (
    id         SERIAL PRIMARY KEY,
    movie_id   INT NOT NULL UNIQUE REFERENCES Films(id) ON DELETE CASCADE,
    factors    FLOAT[] NOT NULL,
    movie_bias FLOAT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_userEvents_user ON user_events(user_id);
CREATE INDEX idx_movieFactors_movie ON movie_factors(movie_id);
CREATE INDEX idx_userFactors_user ON user_factors(user_id);
CREATE INDEX idx_userEvents_entity ON user_events(entity_type, entity_id);
CREATE INDEX idx_userRecomendations_movie ON user_recomendations(movie_id);
CREATE INDEX idx_userRecomendations_shelf ON user_recomendations(shelf_id);
CREATE INDEX idx_userRecomendations_user ON user_recomendations(user_ID);

