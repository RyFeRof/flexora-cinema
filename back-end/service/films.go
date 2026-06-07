package service

import (
	"errors"
	"fullstack/models"
	"fullstack/repository"
)

func GetFilms(limit int, lastId int) ([]models.Film, error) {
	if limit <= 0 || limit > 100 {
		return nil, errors.New("Неккоректно задан лимит")
	}
	return repository.GetFilms(limit, lastId)
}
