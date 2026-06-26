package service

import (
	"errors"
	"fullstack/context"
	"fullstack/models"
	"fullstack/repository"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func generateTokenPair(userId int, deviceId string) (*TokenPair, error) {
	accesToken, err := context.JwtManager.GenerateAccesToken(userId, deviceId)
	if err != nil {
		return nil, err
	}
	refreshToke, err := context.JwtManager.GenerateRefreshToken(userId, deviceId)
	if err != nil {
		return nil, err
	}
	claims, err := context.JwtManager.Parse(refreshToke)
	if err != nil {
		return nil, err
	}
	err = repository.SaveToken(claims.JTI, deviceId, userId, claims.ExpiresAt.Time)
	if err != nil {
		return nil, err
	}
	return &TokenPair{AccessToken: accesToken, RefreshToken: refreshToke}, nil
}

func Register(user models.User, deviceId string) (*TokenPair, error) {
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
	userId, err := repository.Register(user)
	if err != nil {
		return nil, err
	}
	return generateTokenPair(userId, deviceId)
}

func Login(login, password, deviceId string) (*TokenPair, error) {
	if strings.TrimSpace(login) == "" {
		return nil, errors.New("Invalid login")
	}
	user, err := repository.Login(login)
	if err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	return generateTokenPair(user.Id, deviceId)
}

func RefreshToken(refreshTokenStr string) (*TokenPair, error) {
	claims, err := context.JwtManager.Parse(refreshTokenStr)
	if err != nil {
		return nil, err
	}
	if claims.Type != models.TokenTypeRefresh {
		return nil, errors.New("Неверный тип токена")
	}
	revoked, err := repository.IsTokenRevoked(claims.JTI)
	if err != nil || revoked {
		_ = repository.RevokeTokenAll(claims.UserId)
		return nil, errors.New("Токен уже отозван. Все сессии завершены")
	}
	if err := repository.RevokeTokenByDevice(claims.UserId, claims.DeviceId); err != nil {
		return nil, err
	}
	return generateTokenPair(claims.UserId, claims.DeviceId)
}

func Logout(userID int, deviceID string) error {
	return repository.RevokeTokenByDevice(userID, deviceID)
}

func LogoutAll(userID int) error {
	return repository.RevokeTokenAll(userID)
}
