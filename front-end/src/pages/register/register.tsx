import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api";
import logo from "../../assets/voidex-logo.png"

interface Props{
    onRegister: () => void
}
export default function RegisterPage({onRegister}: Props) {
    const [login, setLogin] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [mail, setMail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const handleClick = async () => {
        setLoading(true)
        setError('')
        try{
            await register(login, password, mail, name, phoneNumber)
            onRegister()
            navigate('/')
        }
        catch {
            setError('temp')
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <div className="bg-pageColor w-screen h-screen justify-center items-center flex">
            <div className="flex flex-col items-center">
                <img src={logo} className="max-w-2xs align-middle items-center my-6" />
                <div className="flex flex-col  bg-cardColor  min-w-xl border border-gray-950 p-6 rounded-3xl text-textColor text-lg font-extralight" >
                    {/**Привественный текст */}
                    <div className="flex flex-col gap-0.5 mb-4">
                        <h1 className="font-semibold text-title text-3xl">Регистрация</h1>
                        <p>Создайте аккаунт за пару секунд</p>
                    </div>
                    {/**Логин инпут */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>ЛОГИН</p>
                            <input placeholder="login" value={login} onChange={ (e) => setLogin(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                    </div>
                    {/**Номер телефона инпут */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>НОМЕР ТЕЛЕФОНА</p>
                            <input placeholder="77777777777" value={phoneNumber} onChange={ (e) => setPhoneNumber(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                    </div>
                    {/**Мэйл инпут */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>EMAIL</p>
                            <input placeholder="user@email.com" value={mail} onChange={ (e) => setMail(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                    </div>
                    {/**Пароль инпут */}
                    <div className="mb-6">
                        <label className="flex flex-col gap-1">
                            <p>ПАРОЛЬ</p>
                            <input type="password" value={password} placeholder="password" onChange={ (e) => setPassword(e.target.value) }
                            className={`rounded-lg py-3 px-2 border ${ error ? 'border-error' : 'border-cardColor/70' } border-cardColor/70 bg-inputColor outline-none focus:border-accent`}/>
                        </label>
                    </div>
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