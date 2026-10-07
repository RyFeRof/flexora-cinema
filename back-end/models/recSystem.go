package models

type Shelf struct {
	Title string `json:"title"`
	Type  string `json:"type"`
	Films []Film `json:"films"`
}
