package handlers

import (
	"context"
	"encoding/json"
	"fullstack/repository"
	"log"
	"net/http"
)

func GetRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := repository.GetAllRoles(context.Background())
	if err != nil {
		http.Error(w, "Ошибка получения со стороны сервера", http.StatusInternalServerError)
		log.Printf("Ошибка запроса к бд: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roles)
}
