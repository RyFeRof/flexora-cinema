package service

import (
	"context"
	"errors"
	"fullstack/models"
	"fullstack/repository"
	"strings"
)

const minSearchQueryLen = 2

func SearchFilmingMembers(ctx context.Context, query string) ([]models.Member, error) {
	query = strings.TrimSpace(query)
	if len([]rune(query)) < minSearchQueryLen {
		return nil, errors.New("поисковый запрос должен содержать минимум 2 символа")
	}
	return repository.SearchFilmingMembers(ctx, query)
}
