package repository

import (
	"context"
	"fullstack/db"
)

func AddCountry(ctx context.Context, country string) (int, error) {
	var id int
	err := db.DB.QueryRow(ctx, "INSERT INTO Countries(name) VALUES($1) RETURNING id;", country).Scan(&id)
	if err != nil {
		return -1, err
	}
	return id, nil
}
