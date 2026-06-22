import { useEffect, useState } from "react";
import type { Film } from "../../types";
import { getFilms } from "../../api";
import FilmCard from "../../components/film_card/film_card";
import MainLayout from "../../layouts/mainLayout";
import HeroBanner from "../../components/banner/banner";

export default function Home() {
    const [films, setFilms] = useState<Film[]>([])

    useEffect(() => {
        getFilms().then(data => { setFilms(data.filter(film => film.card?.path)) })
    }, [])
    return (
        <MainLayout>
            <HeroBanner films={films}></HeroBanner>
        </MainLayout>
    )
}