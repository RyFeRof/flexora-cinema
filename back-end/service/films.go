package service

import (
	"fullstack/models"
	"fullstack/repository"
)

func GetFilms(limit int, offset int) ([]models.Film, error) {
	return repository.GetFilms(limit, offset)
}
