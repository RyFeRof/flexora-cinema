package models

import (
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

type RegRequest struct {
	DeviceId    string `json:"device_id"`
	Name        string `json:"name"`
	Login       string `json:"login"`
	Password    string `json:"password"`
	Mail        string `json:"mail"`
	PhoneNumber string `json:"phone_number"`
}

type Claims struct {
	UserId   int    `json:"sub"`
	Type     string `json:"type"`
	DeviceId string `json:"device_id"`
	JTI      string `json:"jti"`
	jwt.RegisteredClaims
}

type Manager struct {
	secret []byte
}

func NewManager(secret string) *Manager {
	return &Manager{secret: []byte(secret)}
}

func (m *Manager) signedToken(tokenType string, userId int, deviceId string, ttl time.Duration) (string, error) {
	jti := uuid.New().String()
	now := time.Now().UTC()

	claims := Claims{
		UserId:   userId,
		Type:     tokenType,
		DeviceId: deviceId,
		JTI:      jti,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "RyFer",
			Subject:   strconv.Itoa(userId),
			ID:        jti,
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}
func (m *Manager) GenerateAccesToken(userId int, deviceId string) (string, error) {
	return m.signedToken(TokenTypeAccess, userId, deviceId, 15*time.Minute)
}
func (m *Manager) GenerateRefreshToken(userId int, deviceId string) (string, error) {
	return m.signedToken(TokenTypeRefresh, userId, deviceId, 7*24*time.Hour)
}
func (m *Manager) Parse(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, Claims{},
		func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("Неожиданный алгоритм подписи")
			}
			return m.secret, nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("Токен не валиден")
	}
	return claims, nil
}
