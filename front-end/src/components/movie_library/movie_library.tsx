import type { Film } from "../../types";
import {useState, useEffect} from 'react'
export default function MovieLibrary(){
    const [films, setFilms] = useState<Film[]>([])
    
    useEffect(() => {
        getFilms().then(data => { setFilms(data.filter(film => film.card?.path)) })
    }, [])
}