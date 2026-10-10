export interface Session {
    device_id: string // UUID устройства (то же, что localStorage.device_id)
    is_this_device: boolean
}
