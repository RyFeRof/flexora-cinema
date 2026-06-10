package handlers

import (
	"fmt"
	"fullstack/repository"
	"net/http"
	"path/filepath"
)

func UploadFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не подходит", http.StatusMethodNotAllowed)
		return
	}
	r.ParseMultipartForm(500 << 20)
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Ошибка получения файла", http.StatusBadRequest)
		return
	}
	allowed := map[string]bool{".jpg": true, ".png": true, ".mp4": true, ".webp": true}
	if !allowed[filepath.Ext(handler.Filename)] {
		http.Error(w, "Недопустимый тип файла", http.StatusBadRequest)
		return
	}
	defer file.Close()
	fileType := r.URL.Query().Get("type")
	if fileType == "" {
		http.Error(w, "Тип файла не указан", http.StatusBadRequest)
		return
	}
	publicPath, err := repository.UploadFile(fileType, handler, file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"path": "%s"}`, publicPath)
}
