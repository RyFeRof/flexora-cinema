package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func SearchFilmingMembers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	members, err := service.SearchFilmingMembers(r.Context(), query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}
