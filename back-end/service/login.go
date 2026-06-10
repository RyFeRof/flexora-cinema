package service

import (
	"errors"
	"fullstack/models"
	"fullstack/repository"
	"strings"
)

func Login(login string) (models.User, error) {
	if strings.TrimSpace(login) == "" {
		return models.User{}, errors.New("Invalid login")
	}
	return repository.Login(login)
}
