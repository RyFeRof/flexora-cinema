package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func GetFilms(w http.ResponseWriter, r *http.Request) {
	films, err := service.GetFilms()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(films)
}
