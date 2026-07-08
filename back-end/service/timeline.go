package service

import (
	"fmt"
	"fullstack/models"
	"strconv"
	"strings"
)

func parseTimeToSeconds(raw string) (int, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return 0, fmt.Errorf("пустое значение времени")
	}

	parts := strings.Split(raw, ":")

	switch len(parts) {
	case 1:
		// просто секунды
		seconds, err := strconv.Atoi(parts[0])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение секунд %q: %w", raw, err)
		}
		if seconds < 0 {
			return 0, fmt.Errorf("время не может быть отрицательным: %q", raw)
		}
		return seconds, nil

	case 2:
		// мм:сс
		minutes, err := strconv.Atoi(parts[0])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение минут в %q: %w", raw, err)
		}
		seconds, err := strconv.Atoi(parts[1])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение секунд в %q: %w", raw, err)
		}
		if minutes < 0 || seconds < 0 || seconds >= 60 {
			return 0, fmt.Errorf("некорректные мм:сс: %q", raw)
		}
		return minutes*60 + seconds, nil

	case 3:
		// чч:мм:сс
		hours, err := strconv.Atoi(parts[0])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение часов в %q: %w", raw, err)
		}
		minutes, err := strconv.Atoi(parts[1])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение минут в %q: %w", raw, err)
		}
		seconds, err := strconv.Atoi(parts[2])
		if err != nil {
			return 0, fmt.Errorf("некорректное значение секунд в %q: %w", raw, err)
		}
		if hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60 {
			return 0, fmt.Errorf("некорректные чч:мм:сс: %q", raw)
		}
		return hours*3600 + minutes*60 + seconds, nil

	default:
		return 0, fmt.Errorf("неизвестный формат времени: %q", raw)
	}
}
func validateTimeline(t models.Timeline) error {
	intro, err := parseTimeToSeconds(t.TimeIntro)
	if err != nil {
		return fmt.Errorf("time_intro: %w", err)
	}
	introEnd, err := parseTimeToSeconds(t.TimeIntroEnd)
	if err != nil {
		return fmt.Errorf("time_intro_end: %w", err)
	}
	outro, err := parseTimeToSeconds(t.TimeOutro)
	if err != nil {
		return fmt.Errorf("time_outro: %w", err)
	}
	outroEnd, err := parseTimeToSeconds(t.TimeOutroEnd)
	if err != nil {
		return fmt.Errorf("time_outro_end: %w", err)
	}

	if introEnd <= intro {
		return fmt.Errorf("time_intro_end должен быть позже time_intro")
	}
	if outroEnd <= outro {
		return fmt.Errorf("time_outro_end должен быть позже time_outro")
	}

	return nil
}
