package models

import (
	"time"
)

type User struct {
	Id          int       `json:"id"`
	Name        string    `json:"name"`
	Login       string    `json:"login"`
	Password    string    `json:"password"`
	Mail        string    `json:"mail"`
	PhoneNumber string    `json:"phone_number"`
	CreatedAt   time.Time `json:"created_at"`
	Is_verify   bool      `json:"is_verify"`
}
type UserSessions struct {
	DeviceId     string `json:"device_id"`
	IsThisDevice bool   `json:"is_this_device"`
}
