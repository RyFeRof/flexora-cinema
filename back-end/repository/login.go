package repository

import (
	"fullstack/db"
	"fullstack/models"
)

func Login(login string) (models.User, error) {
	var u models.User
	err := db.DB.QueryRow("SELECT id, name, login, password, mail, phoneNumber, createdAt FROM Users WHERE login=$1;", login).Scan(&u.Id, &u.Name, &u.Login, &u.Password, &u.Mail, &u.PhoneNumber, &u.CreatedAt)
	return u, err
}
