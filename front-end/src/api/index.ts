import axios from "axios";
import type { Film, Release } from "../types"

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
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data.path
}