package main

import (
	"fullstack/db"
	"fullstack/middleware"
	"fullstack/route"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db.Init()
	mux := route.SetupRouter()
	log.Println("Сервер запущен на :8080")
	log.Fatal(http.ListenAndServe(":8080", middleware.CorsMiddleware(mux)))
}
