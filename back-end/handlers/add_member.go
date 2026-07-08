package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func AddFilmingMember(w http.ResponseWriter, r *http.Request) {
	var name string
	if err := json.NewDecoder(r.Body).Decode(&name); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := service.AddFilmingMember(r.Context(), name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": id})
}
