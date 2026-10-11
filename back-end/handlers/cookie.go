package handlers

import (
	"net/http"
	"os"
	"strings"
)

const refreshCookieMaxAge = 7 * 24 * 3600

func cookieSecure() bool {
	return strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true")
}

func setRefreshCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		HttpOnly: true,
		Secure:   cookieSecure(),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   refreshCookieMaxAge,
	})
}

func clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   cookieSecure(),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   -1,
	})
}
