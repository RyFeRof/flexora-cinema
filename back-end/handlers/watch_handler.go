package handlers

import "net/http"

func WatchFilmPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/player.html")
}
