package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
	"strconv"
)

func GetRelease(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	numStr := r.URL.Query().Get("seria")
	seasonStr := r.URL.Query().Get("season")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	season := 1
	seria := 1

	if seasonStr != "" {
		season, err = strconv.Atoi(seasonStr)
		if err != nil {
			http.Error(w, "invalid season", http.StatusBadRequest)
			return
		}
	}
	if numStr != "" {
		seria, err = strconv.Atoi(numStr)
		if err != nil {
			http.Error(w, "invalid seria", http.StatusBadRequest)
			return
		}
	}
	ctx := r.Context()
	rel, err := service.GetRelease(ctx, id, season, seria)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rel)
}
