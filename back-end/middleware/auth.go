package middleware

import (
	"fullstack/models"
	"net/http"
	"strings"
)

var jwtManager *models.Manager

func InitAuth(secret string) {
	jwtManager = models.NewManager(secret)
}
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := jwtManager.Parse(tokenStr)
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		if claims.Type != models.TokenTypeAccess {
			http.Error(w, "wrong token type", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)

	}
}
