

DROP TABLE IF EXISTS movie_factors;
DROP TABLE IF EXISTS user_factors;
DROP TABLE IF EXISTS user_events;
DROP TABLE IF EXISTS user_recomendations;
DROP TABLE IF EXISTS shelves;

ALTER TABLE Films DROP COLUMN embedding;