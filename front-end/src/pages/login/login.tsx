import { useState } from "react";
import { Link, useNavigate }  from "react-router-dom"
import { login } from "../../api"
import logo from "../../assets/voidex-logo.png"

interface Props {
  onLogin: () => void
}


export default function Login({onLogin}: Props) {
    const [loginVal, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true)
        setError(false)
        try {
            await login(loginVal,password)
            onLogin()
            navigate('/')
        }
        catch {
            setError(true)
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
                    {/* Полz для логина */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>EMAIL ИЛИ ЛОГИН</p>
                            <input placeholder="login" value={loginVal} onChange={ (e) => setLogin(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                    </div>
                    {/** Поле для пароля */}
                    <div className="flex flex-col gap-1 mb-5">
                        <label className="flex flex-col gap-1">
                            <p>ПАРОЛЬ</p>
                            <input type="password" value={password} placeholder="password" onChange={ (e) => setPassword(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                        <Link to="/password/forgot">
                            <p className="text-accent underline underline-offset-3 text-right transition-colors hover:text-accent/80">Забыли пароль?</p>
                        </Link>
                    </div>
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
