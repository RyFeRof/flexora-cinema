import {
    validateLogin,
    validateMail,
    validateName,
    validatePhoneNumber,
} from "../../../validator/validator"
import type { ChangeType } from "../model/types"

export const validators: Record<ChangeType, (value: string) => string | null> = {
    name: validateName,
    login: validateLogin,
    mail: validateMail,
    phone_number: validatePhoneNumber,
}
