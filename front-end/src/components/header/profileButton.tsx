export default function ProfileBtn(){
    const handleClick=() => window.location.href="/login"
    return (
        <button
            onClick={handleClick}
            aria-label="Профиль"
            className="text-title/70 transition-colors hover:text-title ">
                Войти
        </button>
    )
}