package cache

import "context"

var RefCache = NewFilmReferenceCache()

func Init(ctx context.Context) error {
	return RefCache.Generate(ctx)
}
