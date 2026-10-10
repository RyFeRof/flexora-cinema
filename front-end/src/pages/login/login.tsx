import { useState } from "react";
import { Link, useNavigate }  from "react-router-dom"
import { login } from "../../api"
import logo from "../../assets/voidex-logo.png"
import { isUnverifiedError } from "../../features/verify-email";
import { validateLogin, validatePassword } from "../../validator/validator";
interface Props {
    onLogin: () => void
}


export default function Login({onLogin}: Props) {
    const [loginVal, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ login?: string; password?: string[] }>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const [unverified, setUnverified] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        const loginError = validateLogin(loginVal);
        const passwordErrors = validatePassword(password);
        if (loginError || passwordErrors.length > 0) {
            setErrors({login: loginError ?? undefined, password: passwordErrors})
            return;
        }
        setLoading(true)
        setErrors({})
        setSubmitError('')
        setUnverified(false)
        try {
            await login(loginVal,password)
            onLogin()
            navigate('/')
        }
        catch (e) {
            if (isUnverifiedError(e)) setUnverified(true)
            else setSubmitError('Неверный логин или пароль')
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center min-h-screen min-w-screen bg-pageColor">
            <div className="flex flex-col items-center">
                <img src={logo} alt="Не удалось загрузить логотип" className="max-w-2xs align-middle items-center my-15"/>
                <div className="flex flex-col  bg-cardColor  min-w-xl border border-gray-950 py-10 px-6 rounded-3xl text-textColor text-lg font-extralight">
                    {/* Приветственный текст */}
                    <div className="flex flex-col gap-0.5 mb-4">
                        <h1 className="font-semibold text-title text-3xl">Вход</h1>
                        <p>Введите данные аккаунта</p>
                    </div>
                    {/* Поле для логина */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>EMAIL ИЛИ ЛОГИН</p>
                            <input placeholder="login" value={loginVal} onChange={ (e) => setLogin(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ errors.login ? 'border-error' : 'border-cardColor/70' } bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.login && <p className="mt-1 text-error">{errors.login}</p>}
                    </div>
                    {/** Поле для пароля */}
                    <div className="flex flex-col gap-1 mb-5">
                        <label className="flex flex-col gap-1">
                            <p>ПАРОЛЬ</p>
                            <input type="password" value={password} placeholder="password" onChange={ (e) => setPassword(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ errors.password?.length ? 'border-error' : 'border-cardColor/70' } bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        {errors.password?.[0] && <p className="text-error">{errors.password[0]}</p>}
                        <Link to="/password/forgot">
                            <p className="text-accent underline underline-offset-3 text-right transition-colors hover:text-accent/80">Забыли пароль?</p>
                        </Link>
                    </div>
                    {submitError && <p className="text-error mb-3">{submitError}</p>}
                    {unverified && (
                        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-4">
                            <p className="text-title">Почта не подтверждена</p>
                            <p className="mt-1 text-base">Подтвердите её кодом из письма, и вы войдёте в аккаунт.</p>
                            <button type="button" onClick={() => navigate('/verify-email')}
                                className="mt-3 rounded-xl bg-accent px-4 py-2 text-base font-semibold text-pageColor transition-opacity hover:opacity-90">
                                Подтвердить почту
                            </button>
                        </div>
                    )}
                    {/**Кнопка авторизации и ссылка на регистрацию */}
                    <button disabled={loading} onClick={handleSubmit} className="text-title cursor-pointer mb-4 text-2xl font-semibold py-3.5 px-4 rounded-2xl border-stroke border-2 transition-colors hover:border-accent disabled:opacity-50">Войти</button>
                    <div className="flex gap-1 justify-center">
                        <p>Нет аккаунта?</p>
                        <Link to="/register">
                            <p className="text-accent underline underline-offset-3">Зарегистрируйтесь</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}