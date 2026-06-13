import axios from "axios";
import type { Film, Release} from "../types"
// import FilmCard from "../components/film_card/film_card";

const api = axios.create({
    baseURL: ''
})

export const getFilms = async (): Promise<Film[]> => {
    const response = await api.get('/api/films', {
        params: {
            last_id: 0,
            limit:10
        }
    })
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

export const uploadFile = async (file: File, type: 'trailer' | 'card' | 'logo'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/api/upload?type=${type}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE1MzQ0MjIsInVzZXJfaWQiOjF9.fYKLIB8zI_ENeUAKMUqWI7fMq1s42877s7a3uNKm1fc'
        }
    })

    return response.data.path
}

export const createFilm = async (film: Film): Promise<{ id: number }> => {
    const response = await api.post('/api/add', film, {
        headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE1MzQ0MjIsInVzZXJfaWQiOjF9.fYKLIB8zI_ENeUAKMUqWI7fMq1s42877s7a3uNKm1fc'
        }
    })
    return response.data
}
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE1MzQ0MjIsInVzZXJfaWQiOjF9.fYKLIB8zI_ENeUAKMUqWI7fMq1s42877s7a3uNKm1fc
