import {useEffect, useState } from "react";
import type { Film } from "../../types";
import { getFilms } from "../../api";
import FilmCard from "../../components/film_card/film_card";

//delete this down
import Logo from "../../components/header/Logo"
import NavigationBtn from "../../components/header/navigation";
//delete this up

export default function Home() {
    const [films, setFilms] = useState<Film[]>([])
    const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)

    useEffect(() => { 
        getFilms().then(data => { setFilms(data.filter(film => film.card?.path)) })
    }, [])

    const handleCardClick = (film: Film) => {
        if (selectedFilm?.id === film.id) {
            setSelectedFilm(null)
        } else {
            setSelectedFilm(film)
        }
    }

    return (
        <div className=" bg-black min-h-screen text-white p-8">
            <Logo/>
            <NavigationBtn/>
            <div className="grid grid-cols-4 gap-4">
                {films.map(film => (
                    <FilmCard
                        key={film.id}
                        film={film}
                        onClick={handleCardClick}
                        isSelected={selectedFilm?.id === film.id}>

                </FilmCard>))}
            </div>
        </div>
    )
}