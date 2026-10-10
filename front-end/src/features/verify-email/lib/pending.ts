// Почта, которую подтверждаем, переживает перезагрузку страницы (только в рамках вкладки).
const KEY = "pending_verify_email"

export const getPendingEmail = (): string | null => sessionStorage.getItem(KEY)
export const setPendingEmail = (email: string) => sessionStorage.setItem(KEY, email)
export const clearPendingEmail = () => sessionStorage.removeItem(KEY)
