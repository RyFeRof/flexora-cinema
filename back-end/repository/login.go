package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func Login(ctx context.Context, login string) (models.User, error) {
	var u models.User
	err := db.DB.QueryRow(ctx, "SELECT id, name, login, password, mail, phoneNumber, createdAt FROM Users WHERE login=$1;", login).Scan(&u.Id, &u.Name, &u.Login, &u.Password, &u.Mail, &u.PhoneNumber, &u.CreatedAt)
	return u, err
}
