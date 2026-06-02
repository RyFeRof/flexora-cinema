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
			trailerId INT REFERENCES Trailers(id)
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
			countryId INT REFERENCES Countries(id)
		);
		`,
		`CREATE TABLE IF NOT EXISTS Genres(
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS FilmGenres(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			genreId INT REFERENCES Genres(id)
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
			roleId INT REFERENCES Roles(id)
		);`,
		`CREATE TABLE IF NOT EXISTS Materials(
			id SERIAL PRIMARY KEY,
			path TEXT NOT NULL,
			length int not null
		);`,
		`CREATE TABLE IF NOT EXISTS Seasons(
			id SERIAL PRIMARY KEY,
			filmId INT REFERENCES Films(id),
			cardId INT REFERENCES FilmCards(id),
			numberSeason TEXT NOT NULL
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
			timeOutroEnd text
		);`,
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
