package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
	"strconv"
)

func GetFilms(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	lastIdStr := r.URL.Query().Get("last_id")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		http.Error(w, "invalid limit", 400)
		return
	}
	lastId, err := strconv.Atoi(lastIdStr)
	if err != nil {
		http.Error(w, "invalid last_id", 400)
		return
	}
	films, err := service.GetFilms(limit, lastId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(films)
}
