package repository

import (
	"fullstack/db"
	"time"
)

func SaveToken(jti, deviceId string, userId int, expiredAt time.Time) error {
	_, err := db.DB.Exec("INSERT INTO RefreshJwtTokens(jti,userId,deviceId,revoked,expired_time) VALUES ($1,$2,$3,false,$4);",
		jti, userId, deviceId, expiredAt.Unix(),
	)
	return err
}
func IsTokenRevoked(jti string) (bool, error) {
	var revoked bool
	err := db.DB.QueryRow("SELECT revoked FROM RefreshJwtTokens WHERE jti=$1;", jti).Scan(&revoked)
	if err != nil {
		return true, err
	}
	return revoked, nil
}
func RevokeTokenByDevice(userId int, deviceId string) error {
	_, err := db.DB.Exec("UPDATE RefreshJwtTokens SET revoked=true WHERE userId=$1 AND deviceId=$2 AND revoked=false", userId, deviceId)
	return err
}
func RevokeTokenAll(userId int) error {
	_, err := db.DB.Exec("UPDATE RefreshJwtTokens SET revoked=true WHERE userId=$1 AND revoked=false", userId)
	return err
}
func DeleteExpired() error {
	_, err := db.DB.Exec("DELETE FROM RefreshJwtTokens WHERE expired_time < $1", time.Now().Unix())
	return err
}
