import { api } from "../../../api"

export async function terminateSession(deviceId: string): Promise<void> {
    await api.delete("/api/user/sessions", { params: { device_id: deviceId } })
}
