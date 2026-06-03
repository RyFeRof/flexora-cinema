import axios from "axios";
import type { Film, Release } from "../types"

const api = axios.create({
    baseURL: 'http://localhost:8080'
})

export const getFilms = async (): Promise<Film[]> => {
    const response = await api.get('/api/films')
    return response.data ?? []
}

export const getRelease = async (film_id: number, season: number, seria: number): Promise<Release> => {
    const response = await api.get(`/api/releases`,{
        params: {
            id: film_id,
            season: season,
            seria: seria
        }
    })
    return response.data ?? null
}
