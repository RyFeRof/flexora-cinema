package service

import (
	"context"
	"errors"
	jwtcontext "fullstack/jwtContext"
	"fullstack/models"
	"fullstack/repository"
	validator "fullstack/service/validate"
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

func Register(ctx context.Context, user models.RegisterRequest, deviceId string) error {
	if strings.TrimSpace(user.Name) == "" {
		return errors.New("Invalid user.Name")
	}
	if strings.TrimSpace(user.Login) == "" {
		return errors.New("Invalid user.Login")
	}
	if strings.TrimSpace(user.Password) == "" {
		return errors.New("Invalid user.Password")
	}
	if strings.TrimSpace(user.Mail) == "" {
		return errors.New("Invalid user.Mail")
	}
	if strings.TrimSpace(user.PhoneNumber) == "" {
		return errors.New("Invalid user.PhoneNumber")
	}
	if err := validator.ValidateRegister(user); err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hash)
	err = repository.Register(ctx, models.User{
		Login:       user.Login,
		Password:    user.Password,
		Mail:        user.Mail,
		PhoneNumber: user.PhoneNumber,
		Name:        user.Name,
	})
	if err != nil {
		return err
	}
	return SendVerifyCode(ctx, "verify", user.Mail)
}

func Login(ctx context.Context, login, password, deviceId string) (*TokenPair, error) {
	if strings.TrimSpace(login) == "" {
		return nil, errors.New("Invalid login")
	}
	if err := validator.ValidateLogin(models.LoginRequest{Login: login, Password: password}); err != nil {
		return nil, err
	}
	user, err := repository.Login(ctx, login)
	if err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("Неверный логин или пароль")
	}
	if !user.Is_verify {
		return nil, errors.New("Регистарция не подтверждена")
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

func VerifyCode(ctx context.Context, purpose, email, plainCode, deviceId string) (*TokenPair, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	plainCode = strings.TrimSpace(plainCode)

	if email == "" || plainCode == "" {
		return nil, errors.New("email и код обязательны")
	}
	if purpose != "verify" && purpose != "reset" {
		return nil, errors.New("некорректный purpose")
	}
	if err := repository.VerifyCode(ctx, purpose, email, plainCode); err != nil {
		return nil, err
	}
	user, err := repository.GetUserByEmail(ctx, email) // id, email_verified, ...
	if err != nil {
		return nil, errors.New("пользователь не найден")
	}

	if err := repository.SetEmailVerified(ctx, user.Id); err != nil {
		return nil, err
	}

	return generateTokenPair(ctx, user.Id, deviceId)
}
