package validator

import (
	"errors"
	"fullstack/models"
	"reflect"
	"regexp"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func init() {
	validate.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		var up, low, digit bool
		for _, r := range fl.Field().String() {
			switch {
			case unicode.IsUpper(r):
				up = true
			case unicode.IsLower(r):
				low = true
			case unicode.IsDigit(r):
				digit = true
			}
		}
		return up && low && digit
	})
	validate.RegisterValidation("mail", func(fl validator.FieldLevel) bool {
		var emailRe = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$`)
		if !emailRe.MatchString(fl.Field().String()) {
			return false
		}
		return true
	})
	validate.RegisterTagNameFunc(func(f reflect.StructField) string {
		name := strings.SplitN(f.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}
func message(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "Поле обязательно"
	case "min":
		return "Минимум " + fe.Param() + " символов"
	case "max":
		return "Максимум " + fe.Param() + " символов"
	case "len":
		return "Должно быть ровно " + fe.Param() + " символов"
	case "numeric":
		return "Только цифры"
	case "mail":
		return "Введенная почта некорректна"
	case "password":
		return "Нужна заглавная, строчная буква и цифра"
	}
	return "Некорректное значение"
}
func Errors(err error) map[string]string {
	var verrs validator.ValidationErrors
	if !errors.As(err, &verrs) {
		return nil
	}
	out := make(map[string]string, len(verrs))
	for _, fe := range verrs {
		out[fe.Field()] = message(fe)
	}
	return out
}
func ValidateRegister(user models.RegisterRequest) error {
	err := validate.Struct(user)
	return err
}
func ValidateLogin(user models.LoginRequest) error {
	err := validate.Struct(user)
	return err
}
