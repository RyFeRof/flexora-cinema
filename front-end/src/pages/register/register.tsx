import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api";
import logo from "../../assets/voidex-logo.png"
import { validateLogin, validateMail, validateName, validatePassword, validatePhoneNumber } from "../../validator/validator";

interface Props {
    onRegister: () => void
}

interface Errors {
    login?: string
    phone?: string
    mail?: string
    name?: string
    password?: string[]
}

export default function RegisterPage({ onRegister }: Props) {
    const [login, setLogin] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [mail, setMail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [submitError, setSubmitError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleClick = async () => {
        const loginError = validateLogin(login)
        const phoneError = validatePhoneNumber(phoneNumber)
        const mailError = validateMail(mail)
        const nameError = validateName(name)
        const passwordErrors = validatePassword(password)

        if (loginError || phoneError || mailError || nameError || passwordErrors.length > 0) {
            setErrors({
                login: loginError ?? undefined,
                phone: phoneError ?? undefined,
                mail: mailError ?? undefined,
                name: nameError ?? undefined,
                password: passwordErrors,
            })
            return
        }

        setLoading(true)
        setErrors({})
        setSubmitError('')
        try {
            await register(login, password, mail, name, phoneNumber)
            onRegister()
            navigate('/')
        }
        catch {
            setSubmitError('Не удалось зарегистрироваться')
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-pageColor w-screen h-full min-h-screen justify-center items-center flex">
            <div className="flex flex-col items-center">
                <img src={logo} className="max-w-2xs align-middle items-center my-4" />
                <div className="flex flex-col bg-cardColor min-w-xl border border-gray-950 p-6 rounded-3xl text-textColor text-lg font-extralight">
                    {/**Приветственный текст */}
                    <div className="flex flex-col gap-0.5 mb-2">
                        <h1 className="font-semibold text-title text-3xl">Регистрация</h1>
                        <p>Создайте аккаунт за пару секунд</p>
                    </div>
                    {/**Логин инпут */}
                    <div className="mb-3">
                        <label className="flex flex-col gap-1">
                            <p>ЛОГИН</p>
                            <input placeholder="login" value={login} onChange={(e) => setLogin(e.target.value)}
                            className={`rounded-lg py-3 px-2 border ${errors.login ? 'border-error' : 'border-cardColor/70'} bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.login && <p className="mt-1 text-error">{errors.login}</p>}
                    </div>
                    {/**Номер телефона инпут */}
                    <div className="mb-3">
                        <label className="flex flex-col gap-1">
                            <p>НОМЕР ТЕЛЕФОНА</p>
                            <input placeholder="77777777777" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`rounded-lg py-3 px-2 border ${errors.phone ? 'border-error' : 'border-cardColor/70'} bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.phone && <p className="mt-1 text-error">{errors.phone}</p>}
                    </div>
                    {/**Мэйл инпут */}
                    <div className="mb-3">
                        <label className="flex flex-col gap-1">
                            <p>EMAIL</p>
                            <input placeholder="user@email.com" value={mail} onChange={(e) => setMail(e.target.value)}
                            className={`rounded-lg py-3 px-2 border ${errors.mail ? 'border-error' : 'border-cardColor/70'} bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.mail && <p className="mt-1 text-error">{errors.mail}</p>}
                    </div>
                    {/**Имя инпут */}
                    <div className="mb-3">
                        <label className="flex flex-col gap-1">
                            <p>ИМЯ</p>
                            <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)}
                            className={`rounded-lg py-3 px-2 border ${errors.name ? 'border-error' : 'border-cardColor/70'} bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.name && <p className="mt-1 text-error">{errors.name}</p>}
                    </div>
                    {/**Пароль инпут */}
                    <div className="mb-3">
                        <label className="flex flex-col gap-1">
                            <p>ПАРОЛЬ</p>
                            <input type="password" value={password} placeholder="password" onChange={(e) => setPassword(e.target.value)}
                            className={`rounded-lg py-3 px-2 border ${errors.password?.length ? 'border-error' : 'border-cardColor/70'} bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.password?.[0] && <p className="mt-1 text-error">{errors.password[0]}</p>}
                    </div>
                    {submitError && <p className="text-error mb-3">{submitError}</p>}
                    {/**Кнопка регистрации и ссылка на авторизацию */}
                    <button disabled={loading} onClick={handleClick} className="text-title cursor-pointer mb-4 text-2xl font-semibold py-3.5 px-4 rounded-2xl border-stroke border-2 transition-colors hover:border-accent disabled:opacity-50">Создать аккаунт</button>
                    <div className="flex gap-1 justify-center">
                        <p>Есть аккаунт?</p>
                        <Link to="/login">
                            <p className="text-accent underline underline-offset-3">Авторизоваться</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}