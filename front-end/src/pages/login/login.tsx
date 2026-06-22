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
/**
 * <div class="m_trailer_container">
                <img src="//avatars.mds.yandex.net/get-ott/1531675/2a00000194fe69e46a7aaf9244d12fc65341/2016x1134" id="trailer-img" class="m_background">
                <video src="/static/data/trailers/Кухня 1.mp4" id="trailer-video" class="m_background m_tc_opacityOn" muted loop></video>
                <a href="#" class="leftArrow">
                    <svg class="icon" width="17" height="36" viewBox="0 0 17 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5001 17.9998L16.6001 3.1998L13.4001 0.799805L0.500097 17.9998L13.4001 35.1998L16.6001 32.7998L5.5001 17.9998Z" fill="currentColor"></path></svg>
                </a>
                <a href="#" class="rightArrow">
                    <svg class="icon" width="17" height="36" viewBox="0 0 17 36" style="transform: rotate(180deg);" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5001 17.9998L16.6001 3.1998L13.4001 0.799805L0.500097 17.9998L13.4001 35.1998L16.6001 32.7998L5.5001 17.9998Z" fill="currentColor"></path></svg>
                </a>
                <div class="m_big_description">
                    <img src="//avatars.mds.yandex.net/get-ott/200035/2a00000194fe6a286ccf3af7c14ead5c9479/960x540">
                    <p>Молодой повар-провинциал попадает в адский котел модного ресторана. Один из лучших российских ситкомов</p>
                </div>
                <div class="controls">
                    <img id="trailer-logo" class="logo_img m_tc_opacityOn" src="//avatars.mds.yandex.net/get-ott/200035/2a00000194fe6a286ccf3af7c14ead5c9479/960x540">
                    <div>
                        <a href="#" class="btns" id="watch_btn">Смотреть сериал</a>
                        <a href="#" class="btns">О сериале</a>
                        <a href="#" class="btns" style="padding:18px">
                            <svg width="3.6rem" height="3.6rem" viewBox="0 0 36 36" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M28.05 13.5V9.3h4.575V5.7H28.05V1.125h-3.6V5.7h-4.2v3.6h4.2v4.2h3.6ZM11.475 5.625h4.275v3.6h-4.275v16.353l4.868-2.524 1.657-.86 1.657.86 4.868 2.524V18h3.6v13.5l-3.6-1.867L18 26.25l-6.525 3.383-3.6 1.867V5.625h3.6Z"></path></svg>
                        </a>
                        <a href="#" class="btns" style="padding:18px">
                            <svg width="2.4rem" height="2.4rem" viewBox="0 0 24 24" fill="#FFF"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.6 12a7.6 7.6 0 1 1-15.2 0 7.6 7.6 0 0 1 15.2 0Zm2.4 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10ZM7.5 13.8h9v-3.6h-9v3.6Z"></path></svg>
                        </a>
                    </div>
                </div>
            </div>
 */