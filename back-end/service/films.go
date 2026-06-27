package service

import (
	"context"
	"errors"
	"fullstack/models"
	"fullstack/repository"
)

func GetFilms(ctx context.Context, limit int, lastId int) ([]models.Film, error) {
	if limit <= 0 || limit > 100 {
		return nil, errors.New("Неккоректно задан лимит")
	}
	return repository.GetFilms(ctx, limit, lastId)
}
