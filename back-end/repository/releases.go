package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

// ПЕРЕДЕЛАТь
func GetRelease(ctx context.Context, id int, season int, seria int) (models.Release, error) {
	row := db.DB.QueryRow(ctx, `
        SELECT r.id, r.number_seria, r.name,
            COALESCE(s.numberSeason, 0), m.path, l.path,
            COALESCE(r.timeIntro,''), COALESCE(r.timeOutro,''),
            COALESCE(r.timeIntroEnd,''), COALESCE(r.timeOutroEnd,'')
        FROM Releases r
        LEFT JOIN Films f on f.id=r.filmId
        LEFT JOIN FilmLogos fl on fl.filmid=f.id
        LEFT JOIN Logos l on l.id=fl.logoId
        LEFT JOIN Seasons s on r.seasonId=s.id
        LEFT JOIN Materials m on m.id=r.materialId
        WHERE r.filmid = $1 AND r.number_seria=$2 AND (s.numberSeason=$3 OR r.seasonId IS NULL);
    `, id, seria, season)

	var r models.Release
	var l models.Logo
	err := row.Scan(&r.Id, &r.NumSeria, &r.Title, &r.NumberSeason,
		&r.Material, &l.Path, &r.TimeIntro, &r.TimeOutro, &r.TimeIntroEnd, &r.TimeOutroEnd)
	if err != nil {
		return r, err
	}
	return r, nil
}
