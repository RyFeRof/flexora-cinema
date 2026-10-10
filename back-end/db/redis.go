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
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}
	Client = redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   0,
	})
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
