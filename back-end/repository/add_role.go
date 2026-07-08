package repository

import (
	"context"
	"fullstack/db"
)

func AddRole(ctx context.Context, role string) (int, error) {
	var id int
	err := db.DB.QueryRow(ctx, "INSERT INTO Roles(name) VALUES($1) RETURNING id;", role).Scan(&id)
	if err != nil {
		return -1, err
	}
	return id, nil
}
