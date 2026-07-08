package service

import (
	"context"
	"errors"
	"fmt"
	"fullstack/cache"
	"fullstack/repository"
	"strings"
)

func AddRole(ctx context.Context, role string) (int, error) {
	role = strings.TrimSpace(role)
	if role == "" || len([]rune(role)) < 2 {
		return -1, errors.New("неверный формат роли")
	}
	id, err := repository.AddRole(ctx, strings.ToLower(role))
	if err != nil {
		return -1, err
	}
	if err := cache.RefCache.Regenerate(ctx); err != nil {
		return -1, fmt.Errorf("роль создана, но не удалось обновить кэш: %w", err)
	}
	return id, nil
}
