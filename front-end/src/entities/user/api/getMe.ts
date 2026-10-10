import { api } from "../../../api"
import type { User } from "../model/types"

export async function getMe(signal?: AbortSignal): Promise<User> {
    const { data } = await api.get<User>("/api/user/me", { signal })
    // Бэк возвращает и password (пустой) — наружу его не отдаём, берём поля явно.
    return {
        id: data.id,
        name: data.name,
        login: data.login,
        mail: data.mail,
        phone_number: data.phone_number,
        created_at: data.created_at,
    }
}
