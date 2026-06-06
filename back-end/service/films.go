package service

import (
	"fullstack/models"
	"fullstack/repository"
)

func GetFilms() ([]models.Film, error) {
	return repository.GetFilms()
}
