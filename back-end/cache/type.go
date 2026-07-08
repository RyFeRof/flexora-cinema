package cache

import (
	"context"
	"fmt"
	"fullstack/repository"
	"sync"
)

type FilmsReferenceCache struct {
	mu        sync.RWMutex
	Genres    map[int]string `json:"genres"`
	Countries map[int]string `json:"countries"`
	Roles     map[int]string `json:"roles"`
}

func NewFilmReferenceCache() *FilmsReferenceCache {
	return &FilmsReferenceCache{
		Genres:    make(map[int]string),
		Countries: make(map[int]string),
		Roles:     make(map[int]string),
	}
}
func (f *FilmsReferenceCache) Generate(ctx context.Context) error {
	roles, err := repository.GetAllRoles(ctx)
	if err != nil {
		return err
	}
	genres, err := repository.GetAllGenres(ctx)
	if err != nil {
		return err
	}
	countries, err := repository.GetAllCountries(ctx)
	if err != nil {
		return err
	}
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, r := range roles {
		f.Roles[r.Id] = r.Role
	}
	for _, c := range countries {
		f.Countries[c.Id] = c.Country
	}
	for _, g := range genres {
		f.Genres[g.Id] = g.Genre
	}
	return nil
}
func resolveNames(m map[int]string, ids []int, entity string) ([]string, error) {
	result := make([]string, 0, len(ids))
	for _, id := range ids {
		name, ok := m[id]
		if !ok {
			return nil, fmt.Errorf("не найден %s с id=%d ", entity, id)
		}
		result = append(result, name)
	}
	return result, nil
}
func (f *FilmsReferenceCache) GenresName(ids []int) ([]string, error) {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return resolveNames(f.Genres, ids, "жанр")
}
func (f *FilmsReferenceCache) CountriesName(ids []int) ([]string, error) {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return resolveNames(f.Countries, ids, "страна")
}
func (f *FilmsReferenceCache) RoleName(id int) (string, error) {
	f.mu.RLock()
	defer f.mu.RUnlock()
	name, ok := f.Roles[id]
	if !ok {
		return "", fmt.Errorf("роль с id=%d не найдена", id)
	}
	return name, nil
}
func (f *FilmsReferenceCache) Regenerate(ctx context.Context) error {
	newObject := NewFilmReferenceCache()
	if err := newObject.Generate(ctx); err != nil {
		return err
	}
	f.mu.Lock()
	defer f.mu.Unlock()
	f.Countries = newObject.Countries
	f.Genres = newObject.Genres
	f.Roles = newObject.Roles
	return nil
}
