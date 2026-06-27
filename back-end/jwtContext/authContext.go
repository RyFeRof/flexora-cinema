package jwtcontext

import "fullstack/models"

var JwtManager *models.Manager

func InitAuth(secret string) {
	JwtManager = models.NewManager(secret)
}
