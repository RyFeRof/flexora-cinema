package repository

import (
	"context"
	"fullstack/db"
	"time"
)

func SaveToken(ctx context.Context, jti, deviceId string, userId int, expiredAt time.Time) error {
	_, err := db.DB.Exec(ctx, "INSERT INTO RefreshJwtTokens(jti,userId,deviceId,revoked,expired_time) VALUES ($1,$2,$3,false,$4);",
		jti, userId, deviceId, expiredAt.Unix())
	return err
}

func IsTokenRevoked(ctx context.Context, jti string) (bool, error) {
	var revoked bool
	err := db.DB.QueryRow(ctx, "SELECT revoked FROM RefreshJwtTokens WHERE jti=$1;", jti).Scan(&revoked)
	if err != nil {
		return true, err
	}
	return revoked, nil
}

func RevokeTokenByDevice(ctx context.Context, userId int, deviceId string) error {
	_, err := db.DB.Exec(ctx, "UPDATE RefreshJwtTokens SET revoked=true WHERE userId=$1 AND deviceId=$2 AND revoked=false", userId, deviceId)
	return err
}

func RevokeTokenAll(ctx context.Context, userId int) error {
	_, err := db.DB.Exec(ctx, "UPDATE RefreshJwtTokens SET revoked=true WHERE userId=$1 AND revoked=false", userId)
	return err
}

func DeleteExpired(ctx context.Context) error {
	_, err := db.DB.Exec(ctx, "DELETE FROM RefreshJwtTokens WHERE expired_time < $1", time.Now().Unix())
	return err
}
