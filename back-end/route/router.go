package route

import (
	"encoding/json"
	"fullstack/handlers"
	"net/http"
)

type ResponseW struct {
	Status string `json:"status"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	var resp ResponseW
	resp.Status = "ok"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()
	// fs := http.FileServer(http.Dir("../front-end"))
	// mux.Handle("/static/", http.StripPrefix("/static/", fs))
	// // mux.HandleFunc("/", handlers.MainPage)
	// // mux.HandleFunc("/watch/film/", handlers.WatchFilmPage)
	// // mux.HandleFunc("/cinema", handlers.CinemaPage)
	mux.HandleFunc("/api/films", handlers.GetFilms)
	// mux.HandleFunc("/admin", handlers.AdminPage)
	// mux.HandleFunc("/add", handlers.AddPage)
	mux.HandleFunc("/api/add", handlers.AddProject)
	mux.HandleFunc("/api/releases", handlers.GetRelease)
	return mux
}
