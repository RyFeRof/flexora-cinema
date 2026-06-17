package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var reg models.RegRequest
	if err := json.NewDecoder(r.Body).Decode(&reg); err != nil {
		http.Error(w, "Ошибка при получении данных", http.StatusBadRequest)
		return
	}
	tokens, err := service.Register(models.User{
		Name:        reg.Name,
		Login:       reg.Login,
		Password:    reg.Password,
		Mail:        reg.Mail,
		PhoneNumber: reg.PhoneNumber,
	}, reg.DeviceId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HttpOnly: true,
		Secure:   false, // только на локалке
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   7 * 24 * 3600,
	})

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token": tokens.AccessToken,
	})
}
