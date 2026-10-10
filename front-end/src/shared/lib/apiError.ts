import axios from "axios"

// Бэк отдаёт ошибки через http.Error — это text/plain, в том числе сырой текст из pgx.
const TECHNICAL = /duplicate key|unique constraint|violates|sqlstate|pq:|pgx/i

export function getApiErrorMessage(
    error: unknown,
    fallback = "Что-то пошло не так. Попробуйте ещё раз",
): string {
    if (!axios.isAxiosError(error)) return fallback
    if (!error.response) return "Нет связи с сервером"

    const { data, status } = error.response
    if (typeof data === "string") {
        const text = data.trim()
        if (TECHNICAL.test(text)) return "Не удалось сохранить: возможно, значение уже занято"
        if (status === 400 && text && text.length <= 120) return text
    }
    return fallback
}
