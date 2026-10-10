package service

import (
	"context"
	"errors"
	"fullstack/models"
	"fullstack/repository"

	"github.com/google/uuid"
)

func GetUserSessions(ctx context.Context, userId int, deviceId string) ([]models.UserSessions, error) {
	if deviceId == "" {
		return nil, errors.New("device_id обязателен")
	}
	if _, err := uuid.Parse(deviceId); err != nil {
		return nil, errors.New("некорректный device_id")
	}
	return repository.GetUserSessions(ctx, userId, deviceId)
}

func DeleteUserSession(ctx context.Context, userId int, deviceId string) error {
	if deviceId == "" {
		return errors.New("device_id обязателен")
	}
	if _, err := uuid.Parse(deviceId); err != nil {
		return errors.New("некорректный device_id")
	}
	return repository.DeleteUserSession(ctx, userId, deviceId)
}
