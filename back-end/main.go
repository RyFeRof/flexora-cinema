package main

import (
	"fullstack/db"
	"fullstack/route"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db.Init()
	route.SetupRouter()
	log.Println("Сервер запущен на :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
