package handlers

import (
	"encoding/json"
	"fullstack/db"
	"fullstack/models"
	"log"
	"net/http"
)

func AddProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var films models.Film
	log.Println("Метод одобрен,идем дальше")
	if err := json.NewDecoder(r.Body).Decode(&films); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tx, err := db.DB.Begin()

	if err != nil {
		log.Println("Begin TX:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer tx.Rollback()
	err = tx.QueryRow(`INSERT INTO Trailers(path) VALUES($1) RETURNING id;`, films.Trailer.Path).Scan(&films.Trailer.Id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	err = tx.QueryRow("INSERT INTO Films(title,description,isSerial,trailerId) VALUES($1,$2,$3,$4) RETURNING id;", films.Title, films.Description, films.IsSerial, films.Trailer.Id).Scan(&films.Id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	err = tx.QueryRow("INSERT INTO FilmCards(filmId,path,is_horizontal) VALUES($1,$2,$3) RETURNING id;", films.Id, films.Card.Path, films.Card.IsHorizontal).Scan(&films.Card.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	err = tx.QueryRow("INSERT INTO Logos(path) VALUES ($1) RETURNING id;", films.Logo.Path).Scan(&films.Logo.Id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err = tx.Exec("INSERT INTO FilmLogos(filmId,logoId) VALUES($1,$2);", films.Id, films.Logo.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tx.Commit()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": int64(*films.Id)})
}
