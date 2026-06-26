package main

import (
	"fullstack/context"
	"fullstack/db"
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
	context.InitAuth(os.Getenv("JWT_SECRET"))
	mux := route.SetupRouter()
	log.Println("Сервер запущен на :8080")
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := repository.DeleteExpired(); err != nil {
				log.Printf("ошибка очистки токенов: %v", err)
			}
		}
	}()
	log.Fatal(http.ListenAndServe(":8080", middleware.CorsMiddleware(mux)))
}
