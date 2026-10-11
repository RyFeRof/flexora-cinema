package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	validator "fullstack/service/validate"
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
	if errs := validator.Errors(err); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]any{"errors": errs})
		return
	}
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
