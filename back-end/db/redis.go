package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

func RedisInit() error {
	var opt *redis.Options
	if url := os.Getenv("REDIS_URL"); url != "" {
		parsed, err := redis.ParseURL(url)
		if err != nil {
			return fmt.Errorf("redis url: %w", err)
		}
		opt = parsed
	} else {
		addr := os.Getenv("REDIS_ADDR")
		if addr == "" {
			addr = "localhost:6379"
		}
		opt = &redis.Options{
			Addr:     addr,
			Password: os.Getenv("REDIS_PASSWORD"),
			DB:       0,
		}
	}
	Client = redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis ping: %w", err)
	}
	log.Println("Подключение к Redis: успешно")
	return nil
}
func Close() error {
	if Client == nil {
		return nil
	}
	return Client.Close()
}
