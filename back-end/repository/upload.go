package repository

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

func UploadFile(fileType string, handler *multipart.FileHeader, file multipart.File) (string, error) {
	uploadDir := fmt.Sprintf("/uploads/%s", fileType)
	os.MkdirAll(uploadDir, os.ModePerm)

	filename := filepath.Base(handler.Filename)
	filename = strings.ReplaceAll(filename, " ", "_")
	savePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(savePath)
	if err != nil {
		return "", errors.New("Ошибка при создании файла")
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		return "", errors.New("Ошибка при записи файла")
	}

	publicPath := fmt.Sprintf("/uploads/%s/%s", fileType, filename)
	return publicPath, nil
}
