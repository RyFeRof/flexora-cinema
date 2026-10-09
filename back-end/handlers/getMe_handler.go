package handlers

import (
	"encoding/json"
	"fullstack/service"
	"net/http"
)

func GetMe(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("userId").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	user, err := service.GetMe(ctx, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
