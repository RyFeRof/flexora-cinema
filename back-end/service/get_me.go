package service

import (
	"context"
	"errors"
	"fullstack/models"
	"fullstack/repository"
)

func GetMe(ctx context.Context, id int) (models.User, error) {
	if id < 1 {
		return models.User{}, errors.New("Некорректно задано id")
	}
	return repository.GetMe(ctx, id)
}
