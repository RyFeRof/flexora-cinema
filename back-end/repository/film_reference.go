package repository

import (
	"context"
	"fmt"
	"fullstack/db"
	"fullstack/models"
)

func GetAllRoles(ctx context.Context) ([]models.Role, error) {
	rows, err := db.DB.Query(ctx, `SELECT id,name FROM Roles;`)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса к бд: %w", err)
	}
	defer rows.Close()
	var roles []models.Role
	for rows.Next() {
		var r models.Role
		err := rows.Scan(&r.Id, &r.Role)
		if err != nil {
			return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
		}
		roles = append(roles, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
	}
	return roles, nil
}

func GetAllGenres(ctx context.Context) ([]models.Genre, error) {
	rows, err := db.DB.Query(ctx, `SELECT id,name FROM Genres;`)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса к бд: %w", err)
	}
	defer rows.Close()
	var genres []models.Genre
	for rows.Next() {
		var g models.Genre
		err := rows.Scan(&g.Id, &g.Genre)
		if err != nil {
			return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
		}
		genres = append(genres, g)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
	}
	return genres, nil
}

func GetAllCountries(ctx context.Context) ([]models.Country, error) {
	rows, err := db.DB.Query(ctx, `SELECT id,name FROM Countries;`)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса к бд: %w", err)
	}
	defer rows.Close()
	var countries []models.Country
	for rows.Next() {
		var c models.Country
		err := rows.Scan(&c.Id, &c.Country)
		if err != nil {
			return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
		}
		countries = append(countries, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Ошибка запроса к бд: %w", err)
	}
	return countries, nil
}
