package main

import (
	"context"
	"fullstack/db"
	jwtcontext "fullstack/jwtContext"
	"fullstack/middleware"
	"fullstack/repository"
	"fullstack/route"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db.Init()
	jwtcontext.InitAuth(os.Getenv("JWT_SECRET"))
	mux := route.SetupRouter()
	serv := &http.Server{
		Addr:    ":8080",
		Handler: middleware.CorsMiddleware(mux),
	}

	log.Println("Сервер запущен на :8080")

	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := repository.DeleteExpired(context.Background()); err != nil {
				log.Printf("ошибка очистки токенов: %v", err)
			}
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := serv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()

	shutDownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := serv.Shutdown(shutDownCtx); err != nil {
		log.Printf("ошибка при остановке сервера: %v", err)
	}
	db.DB.Close()
	log.Println("Сервер остановлен")

}
