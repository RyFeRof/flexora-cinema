export default function ProfileBtn(){
    const handleClick=() => window.location.href="/login"
    return (
        <button
            onClick={handleClick}
            aria-label="Войти"
            className="shrink-0 rounded-lg bg-accent px-6 py-2 text-md font-medium text-title transition-opacity hover:opacity-90">
                Войти
        </button>
    )
}