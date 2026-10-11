package handlers

import (
	"encoding/json"
	"fullstack/service"
	"log"
	"net/http"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "refresh token not found", http.StatusUnauthorized)
		return
	}
	ctx := r.Context()
	tokens, err := service.RefreshToken(ctx, cookie.Value)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	setRefreshCookie(w, tokens.RefreshToken)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token": tokens.AccessToken,
	})
}
