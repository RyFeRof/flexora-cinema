package repository

import (
	"fullstack/db"
	"fullstack/models"
)

func AddProject(films models.Film) (int, error) {
	tx, err := db.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	err = tx.QueryRow(`INSERT INTO Trailers(path) VALUES($1) RETURNING id;`, films.Trailer.Path).Scan(&films.Trailer.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow("INSERT INTO Films(title,description,isSerial,trailerId) VALUES($1,$2,$3,$4) RETURNING id;", films.Title, films.Description, films.IsSerial, films.Trailer.Id).Scan(&films.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow("INSERT INTO FilmCards(filmId,path,is_horizontal) VALUES($1,$2,$3) RETURNING id;", films.Id, films.Card.Path, films.Card.IsHorizontal).Scan(&films.Card.Id)
	if err != nil {
		return 0, err
	}
	err = tx.QueryRow("INSERT INTO Logos(path) VALUES ($1) RETURNING id;", films.Logo.Path).Scan(&films.Logo.Id)
	if err != nil {
		return 0, err
	}
	_, err = tx.Exec("INSERT INTO FilmLogos(filmId,logoId) VALUES($1,$2);", films.Id, films.Logo.Id)
	if err != nil {
		return 0, err
	}
	tx.Commit()
	return films.Id, nil
}
