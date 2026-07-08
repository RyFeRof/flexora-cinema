package service

import (
	"context"
	"errors"
	"fullstack/repository"
	"strings"
)

func AddFilmingMember(ctx context.Context, name string) (int, error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) < 2 {
		return -1, errors.New("неверный формат имени участника")
	}
	return repository.AddFilmingMember(ctx, name)
}
