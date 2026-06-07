package route

import (
	"fullstack/handlers"
	"net/http"
)

func SetupRouter() *http.ServeMux {
	uploads := http.FileServer(http.Dir("/uploads/"))
	mux := http.NewServeMux()
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", uploads))
	mux.HandleFunc("/api/films", handlers.GetFilms)
	mux.HandleFunc("/api/add", handlers.AddProject)
	mux.HandleFunc("/api/releases", handlers.GetRelease)
	mux.HandleFunc("/api/upload", handlers.UploadFile)
	return mux
}
