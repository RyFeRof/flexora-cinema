package db

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	pgvectorpgx "github.com/pgvector/pgvector-go/pgx"
)

var DB *pgxpool.Pool

func Init() {
	var err error
	databaseURL := os.Getenv("DB_URL")

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatal(err)
	}

	config.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		return pgvectorpgx.RegisterTypes(ctx, conn)
	}

	ctx := context.Background()

	DB, err = pgxpool.NewWithConfig(ctx, config) // ← без ":", иначе тень на пакетную DB
	if err != nil {
		log.Fatal("Ошибка подключения бд:", err)
	}
	if err := migration(databaseURL); err != nil {
		log.Fatal(err)
	}
	if err = DB.Ping(context.Background()); err != nil {
		log.Fatal("Нет ответа от бд:", err)
	}
	log.Println("Подключение к бд: успешно")

}
func migration(databaseURL string) error {
	m, err := migrate.New("file://migrations", databaseURL)
	if err != nil {
		return fmt.Errorf("Ошибка создания новой миграции: %w", err)
	}
	defer m.Close()
	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Println("Нету новых миграций")
			return nil
		}
		return fmt.Errorf("Ошибка миграции: %w", err)
	}
	log.Println("Миграции прошли успешно")
	return nil
}
