package repository

import (
	"context"
	"fmt"
	"fullstack/db"
	"fullstack/models"

	"github.com/jackc/pgx/v5"
	"github.com/pgvector/pgvector-go"
)

func AddProject(ctx context.Context, req models.CreateFilmRequest, vector []float32) (int, error) {
	tx, err := db.DB.Begin(ctx)
	if err != nil {
		return -1, err
	}
	var film models.Film
	film.Trailer = &models.Trailer{}
	film.Card = &models.Card{}
	film.Logo = &models.Logo{}
	defer tx.Rollback(ctx)
	err = tx.QueryRow(ctx, `INSERT INTO Trailers(path) VALUES($1) RETURNING id;`, req.TrailerPath).Scan(&film.Trailer.Id)
	if err != nil {
		return -1, err

	}
	embedding := pgvector.NewVector(vector)
	err = tx.QueryRow(ctx,
		"INSERT INTO Films(title,description,isSerial,trailerId,embedding) VALUES($1,$2,$3,$4,$5) RETURNING id;",
		req.Title, req.Description, req.IsSerial, film.Trailer.Id, embedding,
	).Scan(&film.Id)
	if err != nil {
		return -1, err
	}
	err = tx.QueryRow(ctx, "INSERT INTO FilmCards(filmId,path,is_horizontal) VALUES($1,$2,$3) RETURNING id;", film.Id, req.CardPath, req.IsHorizontal).Scan(&film.Card.Id)
	if err != nil {
		return -1, err
	}
	err = tx.QueryRow(ctx, "INSERT INTO Logos(path) VALUES ($1) RETURNING id;", req.LogoPath).Scan(&film.Logo.Id)
	if err != nil {
		return -1, err
	}
	_, err = tx.Exec(ctx, "INSERT INTO FilmLogos(filmId,logoId) VALUES($1,$2);", film.Id, film.Logo.Id)
	if err != nil {
		return -1, err
	}
	_, err = tx.Exec(ctx, "INSERT INTO FilmCountries(filmId, countryId) SELECT $1, unnest($2::int[]);", film.Id, req.CountryIds)
	if err != nil {
		return -1, err
	}
	_, err = tx.Exec(ctx, "INSERT INTO FilmGenres(filmId, genreId) SELECT $1, unnest($2::int[]);", film.Id, req.GenreIds)
	if err != nil {
		return -1, err
	}
	batch := &pgx.Batch{}
	for _, fm := range req.FilmingMembers {
		batch.Queue(`INSERT INTO FilmFilmingMembers (filmId, memberId, roleId) VALUES ($1, $2, $3);`, film.Id, fm.Id, fm.RoleId)
	}
	br := tx.SendBatch(ctx, batch)
	for range req.FilmingMembers {
		if _, err := br.Exec(); err != nil {
			br.Close()
			return -1, fmt.Errorf("ошибка вставки участников: %w", err)
		}
	}
	if err := br.Close(); err != nil {
		return -1, fmt.Errorf("ошибка вставки участников: %w", err)
	}

	var materialId int
	err = tx.QueryRow(ctx, "INSERT INTO Materials(path) VALUES($1) RETURNING id;", req.MaterialPath).Scan(&materialId)
	if err != nil {
		return -1, err
	}
	_, err = tx.Exec(ctx, "INSERT INTO Releases(filmId, materialId, number_seria, name, timeIntro, timeOutro, timeIntroEnd, timeOutroEnd, dateCreate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);", film.Id, materialId, 1, film.Title, req.Timeline.TimeIntro, req.Timeline.TimeOutro, req.Timeline.TimeIntroEnd, req.Timeline.TimeOutroEnd, req.DateCreate.UTC())
	if err != nil {
		return -1, err
	}
	return film.Id, tx.Commit(ctx)
}
