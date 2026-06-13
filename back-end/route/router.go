package route

import (
	"fullstack/handlers"
	"fullstack/middleware"
	"net/http"
)

func SetupRouter() *http.ServeMux {
	uploads := http.FileServer(http.Dir("./uploads/")) // относительный путь
	mux := http.NewServeMux()
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", uploads))
	mux.HandleFunc("/api/films", handlers.GetFilms)
	mux.HandleFunc("/api/add", middleware.AuthMiddleware(handlers.AddProject))
	mux.HandleFunc("/api/releases", middleware.AuthMiddleware(handlers.GetRelease))
	mux.HandleFunc("/api/upload", middleware.AuthMiddleware(handlers.UploadFile))
	mux.HandleFunc("/api/register", handlers.Register)
	mux.HandleFunc("/api/login", handlers.Login)
	return mux
}
