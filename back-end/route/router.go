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
	mux.HandleFunc("GET /api/films/genres", middleware.AuthMiddleware(handlers.GetGenres))
	mux.HandleFunc("POST /api/films/genres", middleware.AuthMiddleware(handlers.AddGenre))
	mux.HandleFunc("GET /api/films/countries", middleware.AuthMiddleware(handlers.GetCountries))
	mux.HandleFunc("POST /api/films/countries", middleware.AuthMiddleware(handlers.AddCountry))
	mux.HandleFunc("GET /api/films/roles", middleware.AuthMiddleware(handlers.GetRoles))
	mux.HandleFunc("POST /api/films/roles", middleware.AuthMiddleware(handlers.AddRole))
	mux.HandleFunc("GET /api/films/filming-members/search", middleware.AuthMiddleware(handlers.SearchFilmingMembers))
	mux.HandleFunc("POST /api/films/filming-members", middleware.AuthMiddleware(handlers.AddFilmingMember))
	return mux
}
