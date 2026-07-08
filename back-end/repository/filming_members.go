package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func GetFilmingMembersByIds(ctx context.Context, ids []int) (map[int]string, error) {
	members := make(map[int]string)
	rows, err := db.DB.Query(ctx, "SELECT id,name FROM FilmingMembers WHERE id=ANY($1::int[])", ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var m models.Member
		if err := rows.Scan(&m.Id, &m.Member); err != nil {
			return nil, err
		}
		members[m.Id] = m.Member
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return members, nil
}
