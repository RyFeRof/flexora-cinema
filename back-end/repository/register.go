package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func Register(ctx context.Context, user models.User) error {
	err := db.DB.QueryRow(ctx, `INSERT INTO Users(login, name, password, mail, phoneNumber) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
		user.Login, user.Name, user.Password, user.Mail, user.PhoneNumber).Scan(&user.Id)
	if err != nil {
		return err
	}
	return nil
}
