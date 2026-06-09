package service

import (
	"errors"
	"fullstack/models"
	"fullstack/repository"
	"strings"
)

func Register(user models.User) (int, error) {
	if strings.TrimSpace(user.Name) == "" {
		return 0, errors.New("Invalid user.Name")
	}
	if strings.TrimSpace(user.Login) == "" {
		return 0, errors.New("Invalid user.Login")
	}
	if strings.TrimSpace(user.Password) == "" {
		return 0, errors.New("Invalid user.Password")
	}
	if strings.TrimSpace(user.Mail) == "" {
		return 0, errors.New("Invalid user.Mail")
	}
	if strings.TrimSpace(user.PhoneNumber) == "" {
		return 0, errors.New("Invalid user.PhoneNumber")
	}
	return repository.Register(user)
}
