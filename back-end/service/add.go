package service

import (
	"context"
	"errors"
	"fmt"
	"fullstack/cache"
	"fullstack/gemini"
	"fullstack/models"
	"fullstack/repository"
	"strings"
	"time"
)

func getTextForEmbedding(title, description string, genres, countires, filmingMembers []string) string {
	var parts []string
	parts = append(parts, fmt.Sprintf("Название: %s", title))
	parts = append(parts, fmt.Sprintf("Описание: %s", description))

	if len(countires) > 0 {
		parts = append(parts, "Страны: "+strings.Join(countires, ", "))
	}
	if len(genres) > 0 {
		parts = append(parts, "Жанры: "+strings.Join(genres, ", "))
	}
	if len(filmingMembers) > 0 {
		parts = append(parts, "Участники: "+strings.Join(filmingMembers, ", "))
	}
	return strings.Join(parts, "; ")
}

func AddProject(ctx context.Context, req models.CreateFilmRequest) (int, error) {
	if strings.TrimSpace(req.Title) == "" {
		return -1, errors.New("название фильма обязательно")
	}
	if strings.TrimSpace(req.CardPath) == "" {
		return -1, errors.New("карточка фильма обязательна")
	}
	if strings.TrimSpace(req.LogoPath) == "" {
		return -1, errors.New("логотип фильма обязателен")
	}
	if strings.TrimSpace(req.Description) == "" {
		return -1, errors.New("описание фильма обязательно")
	}
	if strings.TrimSpace(req.TrailerPath) == "" {
		return -1, errors.New("трейлер фильма обязателен")
	}
	if strings.TrimSpace(req.MaterialPath) == "" {
		return -1, errors.New("фильм обязателен")
	}
	if !req.DateCreate.IsZero() {
		if req.DateCreate.UTC().Year() < 1900 {
			return -1, errors.New("дата премьеры выглядит некорректно")
		}
		if req.DateCreate.After(time.Now()) {
			return -1, errors.New("дата премьеры не может быть в будущем")
		}
	} else {
		return -1, errors.New("дата премьеры релиза обязательна")
	}
	if strings.TrimSpace(req.Timeline.TimeIntro) != "" && strings.TrimSpace(req.Timeline.TimeIntroEnd) != "" && strings.TrimSpace(req.Timeline.TimeOutro) != "" && strings.TrimSpace(req.Timeline.TimeOutroEnd) != "" {
		if err := validateTimeline(req.Timeline); err != nil {
			return -1, err
		}
	}
	if len(req.CountryIds) == 0 {
		return -1, errors.New("страна фильма обязательна")
	}
	if len(req.GenreIds) == 0 {
		return -1, errors.New("жанры фильма обязательны")
	}
	if len(req.FilmingMembers) == 0 {
		return -1, errors.New("участники съёмок обязательны")
	}

	genres, err := cache.RefCache.GenresName(req.GenreIds)
	if err != nil {
		return -1, err
	}
	countries, err := cache.RefCache.CountriesName(req.CountryIds)
	if err != nil {
		return -1, err
	}

	membersId := make([]int, len(req.FilmingMembers))
	for i, fm := range req.FilmingMembers {
		membersId[i] = fm.Id
	}
	members, err := repository.GetFilmingMembersByIds(ctx, membersId)
	if err != nil {
		return -1, err
	}
	membersDesc := make([]string, 0, len(req.FilmingMembers))
	for _, fm := range req.FilmingMembers {
		name, ok := members[fm.Id]
		if !ok {
			return -1, fmt.Errorf("участник с id=%d не найден", fm.Id)
		}
		roleName, err := cache.RefCache.RoleName(fm.RoleId)
		if err != nil {
			return -1, err
		}
		membersDesc = append(membersDesc, fmt.Sprintf("%s: %s", name, roleName))
	}
	text := getTextForEmbedding(req.Title, req.Description, genres, countries, membersDesc)
	vector, err := gemini.GetEmbedding(ctx, text)
	if err != nil {
		return -1, err
	}
	return repository.AddProject(ctx, req, vector)
}
