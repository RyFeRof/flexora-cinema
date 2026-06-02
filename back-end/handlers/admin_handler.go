package handlers

import (
	"net/http"
)

func AdminPage(w http.ResponseWriter, r *http.Request) {

	http.ServeFile(w, r, "static/adminPanel.html")
}
