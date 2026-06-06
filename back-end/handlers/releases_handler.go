package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
	"strconv"
)

func GetRelease(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	numStr := r.URL.Query().Get("seria")
	seasonStr := r.URL.Query().Get("season")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", 400)
		return
	}
	seria, err := strconv.Atoi(numStr)
	if err != nil {
		http.Error(w, "invalid seria", 400)
		return
	}
	season, err := strconv.Atoi(seasonStr)
	if err != nil {
		http.Error(w, "invalid season", 400)
		return
	}
	rel, err := service.GetRelease(id, season, seria)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rel)
}
