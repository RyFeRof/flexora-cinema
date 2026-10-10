import axios from "axios"
import { getDeviceId, setAccessToken } from "../../../api"

// Plain axios (не api): 401 здесь значит «неверный код», а не «протух токен» —
// интерцептор api увёл бы пользователя на /login.

export async function sendVerificationCode(email: string): Promise<void> {
    await axios.post("/api/auth/send-verification", { purpose: "verify", email }, { withCredentials: true })
}

export async function verifyEmail(email: string, code: string): Promise<void> {
    const { data } = await axios.post<{ access_token: string }>(
        "/api/auth/verify-email",
        { purpose: "verify", email, code, device_id: getDeviceId() },
        { withCredentials: true },
    )
    setAccessToken(data.access_token)
}
