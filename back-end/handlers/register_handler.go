package handlers

import (
	"encoding/json"
	"fullstack/auth"
	"fullstack/models"
	"fullstack/service"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var newUser models.User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		http.Error(w, "Ошибка при получении данных", http.StatusBadRequest)
		return
	}
	pas, err := auth.HashPassword(newUser.Password)
	if err != nil {
		http.Error(w, "Invalid password hash: "+err.Error(), http.StatusBadRequest)
		return
	}
	newUser.Password = pas
	id, err := service.Register(newUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": int64(id)})
}
