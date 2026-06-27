package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func AddProject(ctx context.Context, films models.Film) (int, error) {
	tx, err := db.DB.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx, `INSERT INTO Trailers(path) VALUES($1) RETURNING id;`, films.Trailer.Path).Scan(&films.Trailer.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow(ctx, "INSERT INTO Films(title,description,isSerial,trailerId) VALUES($1,$2,$3,$4) RETURNING id;", films.Title, films.Description, films.IsSerial, films.Trailer.Id).Scan(&films.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow(ctx, "INSERT INTO FilmCards(filmId,path,is_horizontal) VALUES($1,$2,$3) RETURNING id;", films.Id, films.Card.Path, films.Card.IsHorizontal).Scan(&films.Card.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow(ctx, "INSERT INTO Logos(path) VALUES ($1) RETURNING id;", films.Logo.Path).Scan(&films.Logo.Id)
	if err != nil {
		return 0, err
	}
	_, err = tx.Exec(ctx, "INSERT INTO FilmLogos(filmId,logoId) VALUES($1,$2);", films.Id, films.Logo.Id)
	if err != nil {
		return 0, err
	}
	return films.Id, tx.Commit(ctx)
}
