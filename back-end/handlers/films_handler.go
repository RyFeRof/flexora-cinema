package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
	"strconv"
)

func GetFilms(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		http.Error(w, "invalid limit", 400)
		return
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		http.Error(w, "invalid offset", 400)
		return
	}
	films, err := service.GetFilms(limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(films)
}
