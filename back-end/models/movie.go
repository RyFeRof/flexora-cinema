package models

type Episode struct {
	Title    *string `json:"title"`
	VideoURL *string `json:"video-url"`
}
type Trailer struct {
	Id   *int    `json:"id"`
	Path *string `json:"path"`
}
type Logo struct {
	Id   *int    `json:"id"`
	Path *string `json:"path"`
}
type Card struct {
	Id           *int    `json:"id"`
	Path         *string `json:"path"`
	IsHorizontal *bool   `json:"is_horizontal"`
}
type Film struct {
	Id          *int     `json:"id"`
	Title       *string  `json:"title"`
	IsSerial    *bool    `json:"is_serial"`
	Trailer     *Trailer `json:"trailer"`
	Card        *Card    `json:"card"`
	Logo        *Logo    `json:"logo"`
	Description *string  `json:"description"`
}
type Release struct {
	Id           *int    `json:"id"`
	FilmId       *int    `json:"film_id"`
	NumSeria     *int    `json:"number_seria"`
	Title        *string `json:"title"`
	NumberSeason *int    `json:"number_season"`
	Material     *string `json:"material"`
	Logo         *Logo   `json:"logo"`
	TimeIntro    *string `json:"time_intro"`
	TimeOutro    *string `json:"time_outro"`
	TimeIntroEnd *string `json:"time_intro_end"`
	TimeOutroEnd *string `json:"time_outro_end"`
}
