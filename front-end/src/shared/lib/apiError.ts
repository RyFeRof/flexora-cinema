import axios from "axios"

// Бэк отдаёт ошибки через http.Error — это text/plain, в том числе сырой текст из pgx / resend.
const TECHNICAL = /duplicate key|unique constraint|violates|sqlstate|pq:|pgx|resend:/i

export function isDuplicateError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false
    const data = error.response?.data
    return typeof data === "string" && /duplicate key|unique constraint/i.test(data)
}

// userFacingStatuses — статусы, при которых бэк отдаёт безопасный текст для пользователя
// (по умолчанию только 400; verify-email возвращает 401, login — 401).
export function getApiErrorMessage(
    error: unknown,
    fallback = "Что-то пошло не так. Попробуйте ещё раз",
    userFacingStatuses: number[] = [400],
): string {
    if (!axios.isAxiosError(error)) return fallback
    if (!error.response) return "Нет связи с сервером"

    const { data, status } = error.response
    if (typeof data === "string") {
        const text = data.trim()
        if (TECHNICAL.test(text)) {
            return isDuplicateError(error)
                ? "Не удалось сохранить: возможно, значение уже занято"
                : fallback
        }
        if (userFacingStatuses.includes(status) && text && text.length <= 120) return text
    }
    return fallback
}
