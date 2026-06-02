package handlers

import "net/http"

func CinemaPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/cinema.html")
}
