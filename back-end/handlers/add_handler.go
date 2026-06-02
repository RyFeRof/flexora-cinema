package handlers

import (
	"net/http"
)

func AddPage(w http.ResponseWriter, r *http.Request) {

	http.ServeFile(w, r, "static/add.html")
}
