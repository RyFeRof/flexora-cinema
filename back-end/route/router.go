package route

import (
	"fullstack/handlers"
	"fullstack/middleware"
	"net/http"
)

func SetupRouter() *http.ServeMux {
	uploads := http.FileServer(http.Dir("uploads")) // относительный путь
	mux := http.NewServeMux()
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", uploads))
	mux.HandleFunc("GET /api/films", middleware.AuthMiddleware(handlers.GetFilms))
	mux.HandleFunc("POST /api/auth/refresh", handlers.RefreshToken)
	mux.HandleFunc("POST /api/films", middleware.AuthMiddleware(handlers.AddProject))
	mux.HandleFunc("GET /api/films/{id}", middleware.AuthMiddleware(handlers.GetRelease))
	mux.HandleFunc("POST /api/films/upload", middleware.AuthMiddleware(handlers.UploadFile))
	mux.HandleFunc("POST /api/auth/register", handlers.Register)
	mux.HandleFunc("POST /api/auth/login", handlers.Login)
	return mux
}
