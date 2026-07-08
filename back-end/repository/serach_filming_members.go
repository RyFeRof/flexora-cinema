package repository

import (
	"context"
	"fmt"
	"fullstack/db"
	"fullstack/models"
	"strings"
)

func SearchFilmingMembers(ctx context.Context, query string) ([]models.Member, error) {
	escaped := strings.NewReplacer("%", "\\%", "_", "\\_").Replace(query)
	pattern := "%" + escaped + "%"

	rows, err := db.DB.Query(ctx,
		`SELECT id, name FROM FilmingMembers
		WHERE name ILIKE $1 ESCAPE '\'
		ORDER BY name
		LIMIT 20;`,
		pattern,
	)
	if err != nil {
		return nil, fmt.Errorf("ошибка поиска участников: %w", err)
	}
	defer rows.Close()

	var members []models.Member
	for rows.Next() {
		var m models.Member
		if err := rows.Scan(&m.Id, &m.Member); err != nil {
			return nil, fmt.Errorf("ошибка чтения строки: %w", err)
		}
		members = append(members, m)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("ошибка чтения строк: %w", err)
	}

	return members, nil
}
