package models

import "time"

type Trailer struct {
	Id   int    `json:"id"`
	Path string `json:"path"`
}

type Logo struct {
	Id   int    `json:"id"`
	Path string `json:"path"`
}

type Card struct {
	Id           int    `json:"id"`
	Path         string `json:"path"`
	IsHorizontal bool   `json:"is_horizontal"`
}

type FilmingMember struct {
	Member Member `json:"member"`
	Role   Role   `json:"role"`
}
type Member struct {
	Id     int    `json:"id"`
	Member string `json:"member"`
}
type Role struct {
	Id   int    `json:"id"`
	Role string `json:"role"`
}

type Genre struct {
	Id    int    `json:"id"`
	Genre string `json:"genre"`
}

type Country struct {
	Id      int    `json:"id"`
	Country string `json:"country"`
}

type Film struct {
	Id             int             `json:"id"`
	Title          string          `json:"title"`
	IsSerial       bool            `json:"is_serial"`
	Release        *Release        `json:"release"`
	Trailer        *Trailer        `json:"trailer"`
	Countries      []Country       `json:"countries"`
	FilmingMembers []FilmingMember `json:"filming_members"`
	Genres         []Genre         `json:"genres"`
	Card           *Card           `json:"card"`
	Logo           *Logo           `json:"logo"`
	Description    string          `json:"description"`
	TimeCreate     time.Time       `json:"created_at"`
	Vector         []float32       `json:"embedding"`
}

type Release struct {
	Id           int    `json:"id"`
	NumSeria     int    `json:"number_seria"`
	Title        string `json:"title"`
	NumberSeason int    `json:"number_season"`
	Material     string `json:"material"`
	TimeIntro    string `json:"time_intro"`
	TimeOutro    string `json:"time_outro"`
	TimeIntroEnd string `json:"time_intro_end"`
	TimeOutroEnd string `json:"time_outro_end"`
}
