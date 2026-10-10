import { api } from "../../../api"
import type { ChangeRequest } from "../model/types"

export async function changeUser(body: ChangeRequest): Promise<void> {
    await api.patch<{ status: string }>("/api/user/change", body)
}
