package handlers

import (
	"encoding/json"
	"fullstack/auth"
	"fullstack/models"
	"fullstack/service"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var inp models.User
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	pas, err := auth.HashPassword(inp.Password)
	if err != nil {
		http.Error(w, "Ошибка сервера брат", http.StatusInternalServerError)
		return
	}
	u, err := service.Login(inp.Login, pas)
	if err != nil {
		http.Error(w, "Ошибка. Проверьте логин или пароль", http.StatusNotFound)
		return
	}
	token, err := auth.GenerateJWT(u.Id)
	if err != nil {
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
