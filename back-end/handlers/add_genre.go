package handlers

import (
	"context"
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func AddGenre(w http.ResponseWriter, r *http.Request) {
	var genre string
	if err := json.NewDecoder(r.Body).Decode(&genre); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := service.AddGenre(context.Background(), genre)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": id})
}
