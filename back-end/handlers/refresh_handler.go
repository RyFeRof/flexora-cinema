package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var ref refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&ref); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}
	tokens, err := service.RefreshToken(ref.RefreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tokens)
}
