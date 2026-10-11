package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	"net/http"
)

func SendVerifyCode(w http.ResponseWriter, r *http.Request) {
	var req models.VerifyCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	err := service.SendVerifyCode(r.Context(), req.Purpose, req.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "done"})
}
func VerifyCode(w http.ResponseWriter, r *http.Request) {
	var req models.VerifyCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tokens, err := service.VerifyCode(r.Context(), req.Purpose, req.Email, req.Code, req.DeviceId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	setRefreshCookie(w, tokens.RefreshToken)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token": tokens.AccessToken,
	})
}
