package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func GetMe(ctx context.Context, id int) (models.User, error) {
	row := db.DB.QueryRow(ctx, `
		SELECT login, name, mail, phoneNumber, createdAt FROM Users WHERE id=$1;
	`, id)
	var u models.User
	u.Id = id
	err := row.Scan(&u.Login, &u.Name, &u.Mail, &u.PhoneNumber, &u.CreatedAt)
	if err != nil {
		return u, err
	}
	return u, nil
}
