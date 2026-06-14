import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFilms } from "../../api";
import type { Film } from "../../types";

// НЕ ЗАБЫТЬ ЗАБРАТЬ ЗАРЯДКУ!!!!!

interface Props {
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void,
}

export default function SearchBar({ isOpen, onOpen, onClose}: Props) {
    const [query, setQuery] = useState("")
    const [films, setFilms] = useState<Film[]>([])
    const inputRef = useRef<HTMLImageElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isOpen) return
        inputRef.current?.focus()
        getFilms().then(data => { setFilms(data.filter(film => film.card?.path)) })
    },[isOpen])
    const q = query.trim().toLowerCase()
    //В дальнейшем реализовать более крутой поиск
    const results= q ? films.filter(f => f.title?.toLowerCase().includes(q)):[]

    const openFilm = (film:Film) => {
        navigate(`/watch?id=${film.id}`)
        handleClose()
    }

    const handleClose= () => {
        setQuery('')
        onClose()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && results.length > 0) openFilm(results[0])
        if (e.key === "Escape") handleClose()
    }
    
    if (!isOpen) return (
        <button onClick={onOpen} aria-label="Поиск" className="text-gray-300 transition-colors  hover:text-white">
            <svg width="2.4rem" height="2.4rem" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-tid="Search"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.4 11a5.9 5.9 0 1 1-11.8 0 5.9 5.9 0 0 1 11.8 0Zm-1.044 6.977a8.5 8.5 0 1 1 2.121-2.121l4.084 4.083-2.122 2.122-4.083-4.084Z" fill="currentColor"></path></svg>
        </button>
    )
    else return (

    )
}

