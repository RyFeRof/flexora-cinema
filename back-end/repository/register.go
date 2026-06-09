package repository

import (
	"fullstack/db"
	"fullstack/models"
)

func Register(user models.User) (int, error) {
	err := db.DB.QueryRow(`INSERT INTO Users(login, name, password, mail, phoneNumber) VALUES ($1, $2, $3, $4, $5) RETURNING id;`, user.Login, user.Name, user.Password, user.Mail, user.PhoneNumber).Scan(&user.Id)
	if err != nil {
		return 0, err
	}
	return user.Id, nil
}
