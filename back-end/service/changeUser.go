package service

import (
	"context"
	"errors"
	"fullstack/models"
	"fullstack/repository"
	"strings"
)

func ChangeUserInfo(ctx context.Context, req models.ChangeRequest) error {
	var err error
	switch req.ChangeType {
	case "login":
		if strings.TrimSpace(req.Input) == "" {
			return errors.New("Неккоректно введен логин")
		}
		err = repository.ChangeLogin(ctx, req)
	case "mail":
		if strings.TrimSpace(req.Input) == "" {
			return errors.New("Неккоректно введена почта")
		}
		err = repository.ChangeMail(ctx, req)
	case "phone_number":
		if strings.TrimSpace(req.Input) == "" {
			return errors.New("Неккоректно введен номер телефона")
		}
		err = repository.ChangePhoneNumber(ctx, req)

	case "name":
		if strings.TrimSpace(req.Input) == "" {
			return errors.New("Неккоректно введено имя")
		}
		err = repository.ChangeName(ctx, req)
	default:
		return errors.New("Нераспознанная команда")
	}
	return err
}
