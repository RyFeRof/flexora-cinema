package service

import (
	"fullstack/models"
	"fullstack/repository"
)

func GetRelease(id int, season int, seria int) (models.Release, error) {
	return repository.GetRelease(id, season, seria)
}
