package route

import (
	"fullstack/handlers"
	"net/http"
)

func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/films", handlers.GetFilms)
	mux.HandleFunc("/api/add", handlers.AddProject)
	mux.HandleFunc("/api/releases", handlers.GetRelease)
	return mux
}
