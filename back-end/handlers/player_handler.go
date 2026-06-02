package handlers

import (
	"encoding/json"
	"fullstack/db"
	"fullstack/models"
	"net/http"
	"strconv"
)

func GetRelease(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	numStr := r.URL.Query().Get("seria")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", 400)
		return
	}
	seria, err := strconv.Atoi(numStr)
	if err != nil {
		http.Error(w, "invalid seria", 400)
		return
	}
	row := db.DB.QueryRow(`
        SELECT r.id,
               f.id,
               r.number_seria,
               r.name,
               s.numberSeason,
               m.path,
               l.path,
               COALESCE(r.timeIntro,''),
               COALESCE(r.timeOutro,''),
               COALESCE(r.timeIntroEnd,''),
               COALESCE(r.timeOutroEnd,'')
        FROM Releases r
        LEFT JOIN Films f on f.id=r.filmId
        LEFT JOIN FilmLogos fl on fl.filmid=f.id
        LEFT JOIN Logos l on l.id=fl.logoId
        LEFT JOIN Seasons s on r.seasonId=s.id
        LEFT JOIN Materials m on m.id=r.materialId
        WHERE r.id = $1 AND r.number_seria=$2
    `, id, seria)

	var f models.Release
	var l models.Logo

	err = row.Scan(
		&f.Id,
		&f.FilmdId,
		&f.NumSeria,
		&f.Title,
		&f.NumberSeason,
		&f.Material,
		&l.Path,
		&f.TimeIntro,
		&f.TimeOutro,
		&f.TimeIntroEnd,
		&f.TimeOutroEnd,
	)

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	f.Logo = &l

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(f)
}
