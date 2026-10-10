package repository

import (
	"context"
	"errors"
	"fmt"
	"fullstack/db"
	"fullstack/models"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const maxCodeAttempts = 3

func SaveCode(ctx context.Context, purpose, email, hashPlainCode string) error {
	key := fmt.Sprintf("code:%s:%s", purpose, email) // code:verify:user@mail.com
	pipe := db.Client.Pipeline()
	pipe.HSet(ctx, key, map[string]any{
		"hash":     hashPlainCode,
		"attempts": 0,
	})
	pipe.Expire(ctx, key, 10*time.Minute)
	_, err := pipe.Exec(ctx)
	return err
}
func VerifyCode(ctx context.Context, purpose, email, plainCode string) error {
	key := fmt.Sprintf("code:%s:%s", purpose, email) // code:verify:user@mail.com
	data, err := db.Client.HGetAll(ctx, key).Result()
	if err != nil {
		return err
	}
	if len(data) == 0 {
		return errors.New("код истёк или не найден")
	}
	attempts, _ := strconv.Atoi(data["attempts"])
	if attempts >= maxCodeAttempts {
		_ = db.Client.Del(ctx, key).Err()
		return errors.New("слишком много попыток, запросите код снова")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(data["hash"]), []byte(plainCode)); err != nil {
		_, _ = db.Client.HIncrBy(ctx, key, "attempts", 1).Result()
		return errors.New("неверный код")
	}
	if err := db.Client.Del(ctx, key).Err(); err != nil {
		return err
	}
	return nil
}
func GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	var u models.User
	err := db.DB.QueryRow(ctx,
		`SELECT id, name, login, mail, phoneNumber, createdAt, is_verify
		FROM Users WHERE mail=$1`, email,
	).Scan(&u.Id, &u.Name, &u.Login, &u.Mail, &u.PhoneNumber, &u.CreatedAt, &u.Is_verify)
	return u, err
}

func SetEmailVerified(ctx context.Context, userId int) error {
	_, err := db.DB.Exec(ctx,
		`UPDATE Users SET is_verify=true WHERE id=$1`, userId)
	return err
}
