package repository

import (
	"context"
	"errors"
	"fullstack/db"
	"fullstack/models"
	"time"
)

func GetUserSessions(ctx context.Context, userId int, deviceId string) ([]models.UserSessions, error) {
	rows, err := db.DB.Query(ctx, `SELECT DISTINCT deviceId FROM RefreshJwtTokens WHERE userId=$1 AND revoked=false AND expired_time > $2`, userId, time.Now().Unix())
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var data []models.UserSessions
	for rows.Next() {
		var us models.UserSessions
		err := rows.Scan(&us.DeviceId)
		if err != nil {
			continue
		}
		us.IsThisDevice = us.DeviceId == deviceId
		data = append(data, us)
	}
	return data, rows.Err()
}
func DeleteUserSession(ctx context.Context, userId int, deviceId string) error {
	tag, err := db.DB.Exec(ctx, `UPDATE RefreshJwtTokens SET revoked=true WHERE userId=$1 and deviceId=$2 and revoked=false`, userId, deviceId)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("сессия не найдена")
	}
	return nil
}
