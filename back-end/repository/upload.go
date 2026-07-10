package repository

import (
	"errors"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

func UploadFile(fileType string, handler *multipart.FileHeader, file multipart.File) (string, error) {
	uploadDir := filepath.Join("uploads", fileType)
	os.MkdirAll(uploadDir, os.ModePerm)
	ext := filepath.Ext(handler.Filename)
	filename := uuid.New().String() + ext
	savePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(savePath)
	if err != nil {
		return "", errors.New("Ошибка при создании файла")
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		return "", errors.New("Ошибка при записи файла")
	}

	publicPath := filepath.Join("/uploads", fileType, filename)
	return publicPath, nil
}
