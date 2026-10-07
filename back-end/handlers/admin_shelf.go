package handlers

// import (
// 	"encoding/json"
// 	"fullstack/service"
// 	"net/http"
// 	"strconv"
// )

// func GetShelf(w http.ResponseWriter, r *http.Request) {
// 	typeShelf := r.URL.Query().Get("type")
// 	userIdStr := r.URL.Query().Get("id")
// 	userId := -1
// 	var err error
// 	if userIdStr != "" {
// 		userId, err = strconv.Atoi(userIdStr)
// 		if err != nil {
// 			http.Error(w, "Неверно передан userId", http.StatusBadRequest)
// 			return
// 		}
// 	}
// 	shelf, err, status := service.GetShelf(typeShelf, userId)
// 	if err != nil {
// 		http.Error(w, err.Error(), status)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(shelf)
// }
