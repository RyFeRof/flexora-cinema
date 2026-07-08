package repository

import (
	"context"
	"fullstack/db"
)

func AddFilmingMember(ctx context.Context, name string) (int, error) {
	var id int
	err := db.DB.QueryRow(ctx, "INSERT INTO FilmingMembers(name) VALUES($1) RETURNING id;", name).Scan(&id)
	if err != nil {
		return -1, err
	}
	return id, nil
}
