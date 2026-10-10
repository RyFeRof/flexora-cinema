import axios from "axios"

// Бэк отвечает на login текстом «Регистарция не подтверждена» (с опечаткой в бэке) —
// ищем по корню слова, а не по точной строке.
export function isUnverifiedError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false
    const data = error.response?.data
    return typeof data === "string" && /не подтвержд/i.test(data)
}

export const isValidCode = (code: string) => /^\d{6}$/.test(code)
