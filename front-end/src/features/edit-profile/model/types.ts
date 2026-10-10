export type ChangeType = "name" | "login" | "mail" | "phone_number"

// id сюда НЕ добавлять: бэк берёт userId из JWT
export interface ChangeRequest {
    change_type: ChangeType
    input: string
}
