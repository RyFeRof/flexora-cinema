package handlers

import (
	"encoding/json"
	"fullstack/repository"
	"net/http"
	"path/filepath"
)

func UploadFile(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(150 << 20); err != nil {
		http.Error(w, "Ошибка получения файла.Файл слишком большой", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Ошибка получения файла", http.StatusBadRequest)
		return
	}
	allowed := map[string]bool{".jpg": true, ".png": true, ".mp4": true, ".webp": true, ".webm": true}
	if !allowed[filepath.Ext(handler.Filename)] {
		http.Error(w, "Недопустимый тип файла", http.StatusBadRequest)
		return
	}
	defer file.Close()
	fileType := r.URL.Query().Get("type")
	allowed = map[string]bool{"trailer": true, "card": true, "logo": true}
	if !allowed[fileType] {
		http.Error(w, "недопустимый тип", http.StatusBadRequest)
		return
	}
	publicPath, err := repository.UploadFile(fileType, handler, file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"path": publicPath})
}
