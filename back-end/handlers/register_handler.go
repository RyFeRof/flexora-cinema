package handlers

import (
	"encoding/json"
	"fullstack/models"
	"fullstack/service"
	validator "fullstack/service/validate"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var reg models.RegRequest
	if err := json.NewDecoder(r.Body).Decode(&reg); err != nil {
		http.Error(w, "Ошибка при получении данных", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	err := service.Register(ctx, models.RegisterRequest{
		Name:        reg.Name,
		Login:       reg.Login,
		Password:    reg.Password,
		Mail:        reg.Mail,
		PhoneNumber: reg.PhoneNumber,
	}, reg.DeviceId)
	if errs := validator.Errors(err); errs != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]any{"errors": errs})
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "verification_required",
		"email":  reg.Mail,
	})
}
