package service

import (
	"context"
	"errors"
	"fmt"
	"fullstack/cache"
	"fullstack/repository"
	"strings"
)

func AddCountry(ctx context.Context, country string) (int, error) {
	country = strings.TrimSpace(country)
	if country == "" || len([]rune(country)) < 2 {
		return -1, errors.New("неверный формат страны")
	}
	id, err := repository.AddCountry(ctx, strings.ToLower(country))
	if err != nil {
		return -1, err
	}
	if err := cache.RefCache.Regenerate(ctx); err != nil {
		return -1, fmt.Errorf("страна создана, но не удалось обновить кэш: %w", err)
	}
	return id, nil
}
