import validator from 'validator';
import PasswordValidator from 'password-validator';

export function validateLogin(login: string): string | null {
    if (!validator.isLength(login, { min: 3, max: 20 })) { return 'Логин должен быть от 3 до 20 символов'; }
    if (!validator.matches(login, /^[a-zA-Z0-9]+$/)) { return 'Только латиница и цифры '; }
    return null;
}

const passwordShablon = new PasswordValidator();

passwordShablon.is().min(8).is().max(64).has().uppercase().has().lowercase().has().digits().has().not().spaces()

const passwordMessages: Record<string, string> = {
    min: "Минимум 8 символов",
    max: "Максимум 64 символа",
    uppercase: "Нужна заглавная буква",
    lowercase: "Нужна строчная буква",
    digits: "Нужна цифра",
    spaces: "Без пробелов"
}

export function validatePassword(password: string): string[] {
    const failed = passwordShablon.validate(password, {list: true}) as string[];
    return failed.map((rule) => passwordMessages[rule] ?? rule);
}

export function validateMail(mail:string): string | null {
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (EMAIL_REGEX.test(mail)) { return null}
    else { return "Введенная почта некорректна"}
}

export function validateName(name: string): string | null {
    if (!validator.isLength(name, { min: 2, max: 20 })) { return 'Имя должен быть от 3 до 20 символов'; }
    if (!validator.matches(name, /^[a-zA-Z]+$/)) { return 'Только латиница'; }
    return null;
}
export function validatePhoneNumber(number: string): string | null {
    if (!validator.matches(number, /^[0-9]+$/)) { return "Номер телефона состоит только из цифр"}
    if (!validator.isLength(number, {min:11, max:11})) { return 'Номер телефона должен состоять из 11 цифр'}
    return null;
}


