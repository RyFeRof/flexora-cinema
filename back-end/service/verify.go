package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"fullstack/repository"
	"fullstack/verify"
	"math/big"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func SendVerifyCode(ctx context.Context, purpose, email string) error {
	n, _ := rand.Int(rand.Reader, big.NewInt(1_000_000))
	code := fmt.Sprintf("%06d", n)

	err := saveCode(ctx, purpose, email, code)
	if err != nil {
		return err
	}
	html := fmt.Sprintf("<p>Ваш код для входа: <strong>%s</strong></p>", code)
	err = verify.Send(strings.ToLower(email), "Ваш код подтверждения", html)
	return err
}

func saveCode(ctx context.Context, purpose, email, plainCode string) error {
	if strings.TrimSpace(purpose) == "" || strings.TrimSpace(email) == "" {
		return errors.New("Некорректно введены данные")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(plainCode), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return repository.SaveCode(ctx, purpose, strings.ToLower(email), string(hash))
}
