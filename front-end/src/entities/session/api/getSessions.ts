import { api } from "../../../api"
import type { Session } from "../model/types"

export async function getSessions(signal?: AbortSignal): Promise<Session[]> {
    const { data } = await api.get<Session[] | null>("/api/user/sessions", { signal })
    // Go кодирует nil-слайс как null
    const list = data ?? []
    // Текущее устройство всегда первым
    return [...list].sort((a, b) => Number(b.is_this_device) - Number(a.is_this_device))
}
