package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func AddCountry(w http.ResponseWriter, r *http.Request) {
	var country string
	if err := json.NewDecoder(r.Body).Decode(&country); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := service.AddCountry(r.Context(), country)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": id})
}
