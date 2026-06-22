import { useCallback, useEffect, useRef, useState } from "react"
import type { Film } from "../../types"

interface HeroBannerProps {
    films: Film[]
}

export default function HeroBanner({ films }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [phase, setPhase] = useState<"visible" | "flash-out" | "flash-in">("visible")
    const [showVideo, setShowVideo] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([])

    const film = films[currentIndex]

    const clearTimers = () => {
        phaseTimers.current.forEach(clearTimeout)
        phaseTimers.current = []
    }

    const goToFilm = useCallback((index: number) => {
        clearTimers()
        setPhase("flash-out")

        const t1 = setTimeout(() => {
            setShowVideo(false)
            setCurrentIndex(index)
            setPhase("flash-in")
            const t2 = setTimeout(() => setPhase("visible"), 50)
            phaseTimers.current.push(t2)
        }, 400)
        phaseTimers.current.push(t1)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            goToFilm((currentIndex + 1) % films.length)
        }, 40000)
        return () => clearInterval(interval)
    }, [currentIndex, films.length, goToFilm])

    useEffect(() => {
        const t = setTimeout(() => setShowVideo(false), 0)  // сброс асинхронно
        const t2 = setTimeout(() => setShowVideo(true), 4000)
        return () => {
            clearTimeout(t)
            clearTimeout(t2)
        }
    }, [currentIndex])

    if (!film) return null

    return (
        <div
        className="relative h-[80vh] w-full overflow-hidden"
        style={{
        opacity: phase === "flash-out" ? 0 : 1,
        transition: phase === "flash-out"
            ? "opacity 0.4s ease-in"
            : "opacity 0.6s ease-out",
        }}>
      { /* Постер */ }
        <img
            key={`card-${film.id}`}
            src={film.card?.path ?? ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
            opacity: showVideo ? 0 : 1,
            transition: "opacity 1.2s ease-in-out",
            }}/>

      { /* Трейлер */ }
        <video
            ref={videoRef}
            key={`trailer-${film.id}`}
            src={film.trailer?.path ?? ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
                opacity: showVideo ? 1 : 0,
                transition: "opacity 1.2s ease-in-out",
            }}
            autoPlay muted loop playsInline/>

      { /* Тень слева — перекрывает постер/видео */ }
        <div className="absolute inset-0"
            style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 70%)",
            }}/>

      { /* Контент — лого, текст, кнопки */ }
        <div className="absolute inset-0 flex flex-col justify-end pb-16 pl-12">
            {film.logo?.path && (
            <img
                src={film.logo?.path ?? ''}
                className="mb-4 h-30 w-auto object-contain object-left"
            />
            )}
            
            <p className="text-white/80 text-base text-md max-w-sm mb-6 leading-relaxed">
                {film.description}
            </p>
            <div className="flex gap-3">
                <button className="bg-accent text-title px-7 py-3.5 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform">
                    ▶ Смотреть
                </button>
                <button className="bg-white/20 text-title px-7 py-3.5 rounded-full font-medium backdrop-blur-sm hover:scale-105 transition-transform">
                    О сериале
                </button>
            </div>
        </div>

      { /* Точки-индикаторы */ }
        <div className="absolute bottom-6 left-12 flex gap-2">
            {films.map((_, i) => (
            <button
                key={i}
                onClick={() => goToFilm(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex
                        ? "w-8 h-1.5 bg-accent"
                        : "w-2 h-1.5 bg-white/40"
                }`}/>
            ))}
        </div>
    </div>
    )
}