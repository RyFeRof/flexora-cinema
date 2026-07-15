package models

import "time"

type CreateFilmRequest struct {
	Title          string                 `json:"title"`
	Description    string                 `json:"description"`
	IsSerial       bool                   `json:"is_serial"`
	GenreIds       []int                  `json:"genre_ids"`
	CountryIds     []int                  `json:"country_ids"`
	FilmingMembers []FilmingMemberRequest `json:"filming_members"`
	CardPath       string                 `json:"card_path"`
	IsHorizontal   bool                   `json:"is_horizontal"`
	LogoPath       string                 `json:"logo_path"`
	TrailerPath    string                 `json:"trailer_path"`
	MaterialPath   string                 `json:"material_path"`
	Timeline       Timeline               `json:"time_line"`
	DateCreate     time.Time              `json:"date_create"`
}
type FilmingMemberRequest struct {
	Id     int `json:"id"`
	RoleId int `json:"role_id"`
}
type Timeline struct {
	TimeIntro    string `json:"time_intro"`
	TimeOutro    string `json:"time_outro"`
	TimeIntroEnd string `json:"time_intro_end"`
	TimeOutroEnd string `json:"time_outro_end"`
}
