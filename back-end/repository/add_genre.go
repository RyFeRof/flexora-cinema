package repository

import (
	"context"
	"fullstack/db"
)

func AddGenre(ctx context.Context, genre string) (int, error) {
	var id int
	err := db.DB.QueryRow(ctx, "INSERT INTO Genres(name) VALUES($1) RETURNING id;", genre).Scan(&id)
	if err != nil {
		return -1, err
	}
	return id, nil
}
