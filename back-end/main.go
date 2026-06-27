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
	"time"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db.Init()
	jwtcontext.InitAuth(os.Getenv("JWT_SECRET"))
	mux := route.SetupRouter()
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
	log.Fatal(http.ListenAndServe(":8080", middleware.CorsMiddleware(mux)))
}
