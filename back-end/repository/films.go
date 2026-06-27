package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func GetFilms(ctx context.Context, limit int, lastId int) ([]models.Film, error) {
	rows, err := db.DB.Query(ctx, `
	SELECT f.id, f.title, f.isSerial, COALESCE(f.description,''),
	f.trailerId, t.path, fc.id, fc.path, fc.is_horizontal, l.id, l.path
	FROM films f
	LEFT JOIN trailers t on t.id=f.trailerId
	LEFT JOIN filmCards fc on fc.filmId=f.id
	LEFT JOIN FilmLogos fl on fl.filmId=f.id
	LEFT JOIN Logos l on l.id=fl.logoId
	WHERE f.id > $1
	ORDER BY f.id
	LIMIT $2;
	`, lastId, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var films []models.Film
	for rows.Next() {
		var f models.Film
		var c models.Card
		var t models.Trailer
		var l models.Logo
		err := rows.Scan(&f.Id, &f.Title, &f.IsSerial, &f.Description, &t.Id, &t.Path, &c.Id, &c.Path, &c.IsHorizontal, &l.Id, &l.Path)
		if err != nil {
			continue
		}
		f.Trailer = &t
		f.Logo = &l
		f.Card = &c
		films = append(films, f)
	}
	return films, nil
}
