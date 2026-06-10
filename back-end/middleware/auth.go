package middleware

import (
	"fullstack/auth"
	"net/http"
	"strings"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Вход в аккаунт неудачен", http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			http.Error(w, "Формат токена не валидный", http.StatusUnauthorized)
			return
		}
		_, err := auth.ParseToken(tokenStr)
		if err != nil {
			http.Error(w, "Токен не валидный", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}
