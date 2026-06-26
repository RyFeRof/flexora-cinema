package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	"log"
	"net/http"
)

func AddProject(w http.ResponseWriter, r *http.Request) {
	var films models.Film
	log.Println("Метод одобрен,идем дальше")
	if err := json.NewDecoder(r.Body).Decode(&films); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id, err := service.AddProject(films)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": int64(id)})
}
