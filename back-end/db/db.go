package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() {
	var err error
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Ошибка подключения бд:", err)
		return
	}
	err = DB.Ping()
	if err != nil {
		log.Fatal("Нет ответа от  бд:", err)
		return
	}
	log.Println("Подключение к бд:успешно")
	migrate()
}
func migrate() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS Trailers(
			id SERIAL PRIMARY KEY,
			path TEXT NOT NULL
		);`,
		`
		CREATE TABLE IF NOT EXISTS Films
		(
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			isSerial BOOLEAN NOT NULL DEFAULT false,
			description TEXT,
			trailerId INT REFERENCES Trailers(id) UNIQUE
		);`,

		`CREATE TABLE IF NOT EXISTS FilmCards(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id) ,
			path TEXT NOT NULL,
			is_horizontal BOOLEAN NOT NULL DEFAULT true
		);`,
		`CREATE TABLE IF NOT EXISTS Logos(
			id SERIAL PRIMARY KEY,
			path TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS FilmLogos(
			id SERIAL PRIMARY KEY,
			logoId INT REFERENCES Logos(id),
			filmId INT REFERENCES Films(id)
		);`,
		`CREATE TABLE IF NOT EXISTS Countries(
				id SERIAL PRIMARY KEY,
				name TEXT UNIQUE NOT NULL
			);
		`,
		`CREATE TABLE IF NOT EXISTS FilmCountries(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			countryId INT REFERENCES Countries(id),
			UNIQUE (filmId, countryId)
		);
		`,
		`CREATE TABLE IF NOT EXISTS Genres(
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS FilmGenres(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			genreId INT REFERENCES Genres(id),
			UNIQUE (filmId, genreId)
		);`,
		`CREATE TABLE IF NOT EXISTS FilmingMembers(
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS Roles(
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS FilmFilmingMembers(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			memberId INT REFERENCES FilmingMembers(id),
			roleId INT REFERENCES Roles(id),
			UNIQUE (filmId, memberId,roleId)
		);`,
		`CREATE TABLE IF NOT EXISTS Materials(
			id SERIAL PRIMARY KEY,
			path TEXT NOT NULL,
			durationSeconds int not null
		);`,
		`CREATE TABLE IF NOT EXISTS Seasons(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			cardId INT REFERENCES FilmCards(id),
			numberSeason INT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS Releases(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			seasonId INT REFERENCES Seasons(id),
			materialId INT REFERENCES Materials(id),
			number_seria INT NOT NULL,
			name TEXT NOT NULL,
			dateCreate date not null default now(),
			timeIntro text,
			timeOutro text,
			timeIntroEnd text,
			timeOutroEnd text,
			UNIQUE (filmId, seasonId,materialId)
		);`,
		`CREATE TABLE IF NOT EXISTS Users(
			id SERIAL PRIMARY KEY,
			login TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			password TEXT NOT NULL,
			mail TEXT NOT NULL,
			phoneNumber TEXT NOT NULL UNIQUE,
			createdAt DATE NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS WatchHistories(
			id SERIAL PRIMARY KEY,
			userId INT REFERENCES Users(id) ON DELETE CASCADE,
			filmId INT REFERENCES Films(id) ON DELETE CASCADE,
			timeWatch TEXT NOT NULL,
			dateWatch date not null default now(),
			UNIQUE (userId,filmId)
		);`,
		`CREATE TABLE IF NOT EXISTS Subscriptions(
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL UNIQUE,
			countMembers INT NOT NULL,
			validityTime INT NOT NULL 
		);`, //validityTime - в днях
		`CREATE TABLE IF NOT EXISTS Groups(
			id SERIAL PRIMARY KEY,
			subId INT REFERENCES Subscriptions(id),
			dateEnd date not null
		);`,
		`CREATE TABLE IF NOT EXISTS GroupUsers(
			id SERIAL PRIMARY KEY,
			groupId INT REFERENCES Groups(id),
			userId INT REFERENCES Users(id),
			isOwner BOOLEAN DEFAULT FALSE,
			UNIQUE (groupId,userId)
		);`,
		`CREATE TABLE IF NOT EXISTS Feedback(
			id SERIAL PRIMARY KEY,
			Valuation INT NOT NULL CHECK (Valuation>0 AND Valuation<=10),
			text TEXT NOT NULL,
			userId INT REFERENCES Users(id) ON DELETE SET NULL,
			releaseId INT REFERENCES Releases(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS RefreshJwtTokens(
			jti UUID PRIMARY KEY,
			userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
			deviceId UUID NOT NULL,
			revoked BOOLEAN DEFAULT false NOT NULL,
			expired_time BIGINT NOT NULL
		);`,
		`CREATE INDEX IF NOT EXISTS idx_tokens_user   ON RefreshJwtTokens(userId);`,
		`CREATE INDEX IF NOT EXISTS idx_tokens_device ON RefreshJwtTokens(userId, deviceId);`,
		`CREATE INDEX IF NOT EXISTS idx_tokens_expiry ON RefreshJwtTokens(expired_time);`,
		`CREATE INDEX IF NOT EXISTS idx_filmgenres_filmid ON FilmGenres(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_filmgenres_genreid ON FilmGenres(genreId);`,
		`CREATE INDEX IF NOT EXISTS idx_filmcountries_filmid ON FilmCountries(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_filmlogos_filmid ON FilmLogos(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_filmcards_filmid ON FilmCards(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_releases_filmid ON Releases(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_releases_seasonid ON Releases(seasonId);`,
		`CREATE INDEX IF NOT EXISTS idx_watchhistories_userid ON WatchHistories(userId);`,
		`CREATE INDEX IF NOT EXISTS idx_watchhistories_filmid ON WatchHistories(filmId);`,
		`CREATE INDEX IF NOT EXISTS idx_groupusers_userid ON GroupUsers(userId);`,
		`CREATE INDEX IF NOT EXISTS idx_groupusers_groupid ON GroupUsers(groupId);`,
		`CREATE INDEX IF NOT EXISTS idx_feedback_userid ON Feedback(userId);`,
		`CREATE INDEX IF NOT EXISTS idx_feedback_releaseid ON Feedback(releaseId);`,
		`CREATE INDEX IF NOT EXISTS idx_seasons_filmid ON Seasons(filmId);`,
	}
	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal("Ошибка миграции", err)
			return
		}
	}

	log.Println("Миграция успешна")

}
