package service

import (
	"context"
	"errors"
	"fmt"
	"fullstack/cache"
	"fullstack/repository"
	"strings"
)

func AddGenre(ctx context.Context, genre string) (int, error) {
	if strings.TrimSpace(genre) == "" || len([]rune(genre)) < 2 {
		return -1, errors.New("Неверный формат жанра")
	}
	id, err := repository.AddGenre(ctx, strings.ToLower(genre))
	if err != nil {
		return -1, err
	}
	if err := cache.RefCache.Regenerate(ctx); err != nil {
		return -1, fmt.Errorf("жанр создан, но не удалось обновить кэш: %w", err)
	}
	return id, nil
}
