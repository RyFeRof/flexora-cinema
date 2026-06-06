package service

import (
	"errors"
	"fullstack/models"
	"fullstack/repository"
	"strings"
)

func AddProject(film models.Film) (int, error) {
	if strings.TrimSpace(film.Title) == "" {
		return 0, errors.New("Название фильма обязательно")
	}
	if film.Card == nil || strings.TrimSpace(film.Card.Path) == "" {
		return 0, errors.New("Карточка фильма обязательна")
	}
	if film.Logo == nil || strings.TrimSpace(film.Logo.Path) == "" {
		return 0, errors.New("Логотип фильма обязателен")
	}
	if strings.TrimSpace(film.Description) == "" {
		return 0, errors.New("Описание фильма обязательно")
	}
	if film.Trailer == nil || strings.TrimSpace(film.Trailer.Path) == "" {
		return 0, errors.New("Трейлер фильма обязателен")
	}
	return repository.AddProject(film)
}
