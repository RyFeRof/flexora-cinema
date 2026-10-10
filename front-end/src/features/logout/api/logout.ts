import { api } from "../../../api"

export async function logout(): Promise<void> {
    await api.post("/api/auth/logout")
}

export async function logoutAll(): Promise<void> {
    await api.post("/api/auth/logout-all")
}
