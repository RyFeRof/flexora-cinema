package service

// import (
// 	"errors"
// 	"fullstack/models"
// 	"log"
// 	"net/http"
// )

// func GetShelf(typeShelf string, userId int) (models.Shelf, error, int) {
// 	var shelf models.Shelf
// 	var err error
// 	switch typeShelf {
// 	case "popular":
// 		shelf, err = repository.GetPopularShelf()
// 		if err != nil {
// 			log.Printf("Ошибка при сборке популярной полки: %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"популярное\""), http.StatusInternalServerError
// 		}
// 	case "new":
// 		shelf, err = repository.GetNewShelf()
// 		if err != nil {
// 			log.Printf("Ошибка при сборке  полки новинок: %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"новинки\""), http.StatusInternalServerError
// 		}
// 	case "new_add":
// 		shelf, err = repository.GetNewAddShelf()
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"недавно в voidex\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"недавно в voidex\""), http.StatusInternalServerError
// 		}
// 	case "top-rated":
// 		shelf, err = repository.GetTopRatedShelf()
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"топ по рейтингу\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"топ по рейтингу\""), http.StatusInternalServerError
// 		}
// 	case "similar-on-genre":
// 		if userId < 1 {
// 			return shelf, errors.New("Неккоретно задан \"userId\""), http.StatusBadRequest
// 		}
// 		shelf, err = repository.GetSimilarOnGenreShelf(userId)
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"похоже на (жанр)\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"похоже на (жанр)\""), http.StatusInternalServerError
// 		}
// 	case "similar-on-film":
// 		if userId < 1 {
// 			return shelf, errors.New("Неккоретно задан \"userId\""), http.StatusBadRequest
// 		}
// 		shelf, err = repository.GetSimilarOnFilmShelf(userId)
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"похожее на (фильм)\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"похожее на (фильм)\""), http.StatusInternalServerError
// 		}
// 	case "similar-on-member":
// 		if userId < 1 {
// 			return shelf, errors.New("Неккоретно задан \"userId\""), http.StatusBadRequest
// 		}
// 		shelf, err = repository.GetSimilarOnMemberShelf(userId)
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"тут участвовал (участник)\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"тут участвовал (участник)\""), http.StatusInternalServerError
// 		}
// 	case "collaborative":
// 		if userId < 1 {
// 			return shelf, errors.New("Неккоретно задан \"userId\""), http.StatusBadRequest
// 		}
// 		shelf, err = repository.GetCollaborativeShelf(userId)
// 		if err != nil {
// 			log.Printf("Ошибка при сборке полки \"voidex рекомендует вам\": %v", err)
// 			return shelf, errors.New("Ошибка при сборки полки \"voidex рекомендует вам\""), http.StatusInternalServerError
// 		}
// 	default:
// 		return shelf, errors.New("Неккоректно задан параметр \"type\""), http.StatusBadRequest
// 	}
// 	return shelf, nil, http.StatusOK
// }
