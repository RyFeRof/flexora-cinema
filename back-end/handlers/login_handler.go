package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var inp models.RegRequest
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	tokens, err := service.Login(ctx, inp.Login, inp.Password, inp.DeviceId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token": tokens.AccessToken,
	})
}
