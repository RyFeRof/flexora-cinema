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
func SetupRouter() {
	fs := http.FileServer(http.Dir("../front-end"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/", handlers.MainPage)
	http.HandleFunc("/watch/film/", handlers.WatchFilmPage)
	http.HandleFunc("/cinema", handlers.CinemaPage)
	http.HandleFunc("/api/films", handlers.GetFilms)
	http.HandleFunc("/admin", handlers.AdminPage)
	http.HandleFunc("/add", handlers.AddPage)
	http.HandleFunc("/api/add", handlers.AddProject)
	http.HandleFunc("/api/releases", handlers.GetRelease)
}
