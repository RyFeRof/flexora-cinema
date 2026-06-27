package service

import (
	"context"
	"errors"
	jwtcontext "fullstack/jwtContext"
	"fullstack/models"
	"fullstack/repository"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func generateTokenPair(ctx context.Context, userId int, deviceId string) (*TokenPair, error) {
	accesToken, err := jwtcontext.JwtManager.GenerateAccesToken(userId, deviceId)
	if err != nil {
		return nil, err
	}
	refreshToke, err := jwtcontext.JwtManager.GenerateRefreshToken(userId, deviceId)
	if err != nil {
		return nil, err
	}
	claims, err := jwtcontext.JwtManager.Parse(refreshToke)
	if err != nil {
		return nil, err
	}
	err = repository.SaveToken(ctx, claims.JTI, deviceId, userId, claims.ExpiresAt.Time)
	if err != nil {
		return nil, err
	}
	return &TokenPair{AccessToken: accesToken, RefreshToken: refreshToke}, nil
}

func Register(ctx context.Context, user models.User, deviceId string) (*TokenPair, error) {
	if strings.TrimSpace(user.Name) == "" {
		return nil, errors.New("Invalid user.Name")
	}
	if strings.TrimSpace(user.Login) == "" {
		return nil, errors.New("Invalid user.Login")
	}
	if strings.TrimSpace(user.Password) == "" {
		return nil, errors.New("Invalid user.Password")
	}
	if strings.TrimSpace(user.Mail) == "" {
		return nil, errors.New("Invalid user.Mail")
	}
	if strings.TrimSpace(user.PhoneNumber) == "" {
		return nil, errors.New("Invalid user.PhoneNumber")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user.Password = string(hash)
	userId, err := repository.Register(ctx, user)
	if err != nil {
		return nil, err
	}
	return generateTokenPair(ctx, userId, deviceId)
}

func Login(ctx context.Context, login, password, deviceId string) (*TokenPair, error) {
	if strings.TrimSpace(login) == "" {
		return nil, errors.New("Invalid login")
	}
	user, err := repository.Login(ctx, login)
	if err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	return generateTokenPair(ctx, user.Id, deviceId)
}

func RefreshToken(ctx context.Context, refreshTokenStr string) (*TokenPair, error) {
	claims, err := jwtcontext.JwtManager.Parse(refreshTokenStr)
	if err != nil {
		return nil, err
	}
	if claims.Type != models.TokenTypeRefresh {
		return nil, errors.New("Неверный тип токена")
	}
	revoked, err := repository.IsTokenRevoked(ctx, claims.JTI)
	if err != nil || revoked {
		_ = repository.RevokeTokenAll(ctx, claims.UserId)
		return nil, errors.New("Токен уже отозван. Все сессии завершены")
	}
	if err := repository.RevokeTokenByDevice(ctx, claims.UserId, claims.DeviceId); err != nil {
		return nil, err
	}
	return generateTokenPair(ctx, claims.UserId, claims.DeviceId)
}

func Logout(ctx context.Context, userID int, deviceID string) error {
	return repository.RevokeTokenByDevice(ctx, userID, deviceID)
}

func LogoutAll(ctx context.Context, userID int) error {
	return repository.RevokeTokenAll(ctx, userID)
}
