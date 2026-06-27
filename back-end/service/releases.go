package service

import (
	"context"
	"fullstack/models"
	"fullstack/repository"
)

func GetRelease(ctx context.Context, id int, season int, seria int) (models.Release, error) {
	return repository.GetRelease(ctx, id, season, seria)
}
