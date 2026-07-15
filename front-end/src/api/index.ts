import axios from "axios";
import type { Film, Release, Genre, Country, Role, Member, CreateFilmRequest } from "../types"
// import FilmCard from "../components/film_card/film_card";

const api = axios.create({
    baseURL: '',
    withCredentials: true
})

let accessToken: string | null = null
export const getAccessToken = () => accessToken
export const setAccessToken = (tokenStr: string | null) => {
    accessToken = tokenStr
} 

function getDeviceId(): string {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device_id", id);
    }
    return id;
}
api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization= `Bearer ${accessToken}`
    return config
})

let isRefreshing = false
let queueQueries: Array<(token: string | null) => void> = []

const proccessQueueQueries = (token: string | null) => {
    queueQueries.forEach((cb) => cb(token))
    queueQueries=[]
}
api.interceptors.response.use((res) => res, async (error) => {
    const originalQuery = error.config
    if (error.response?.status === 401 && !originalQuery._retry) {
        originalQuery._retry = true
        if (isRefreshing) {
            return new Promise((resolve) => {
                queueQueries.push((token) => {
                    originalQuery.headers.Authorization = `Bearer ${token}`
                    resolve(api(originalQuery))
                })
            })
        }
        isRefreshing = true
        try {
            const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true })
            setAccessToken(data.access_token)
            proccessQueueQueries(accessToken)
            originalQuery.headers.Authorization = `Bearer ${accessToken}`
            return api(originalQuery)
        }
        catch {
            setAccessToken(null)
            if (window.location.pathname !== '/login') {
                window.location.href = "/login"
            }
            return Promise.reject(error)
        }
        finally {
            isRefreshing = false
        }
    }
    return Promise.reject(error) // ← вот эта строка отсутствовала
})

export const login = async (login: string, password: string) => {
    const response = await axios.post('/api/auth/login', {  // ← axios, не api
        login,
        password,
        device_id: getDeviceId()
        }, { withCredentials: true })
    setAccessToken(response.data.access_token)
}
export const register = async (login: string, password: string, mail: string, name: string, phone_number:string) => {
    const response = await axios.post('/api/auth/register', {
        login, password, mail, name, phone_number, device_id: getDeviceId()
    }, {withCredentials: true})
    setAccessToken(response.data.access_token)
}

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
    const response = await api.get(`/api/films/${film_id}`,{
        params: {
            season: season,
            seria: seria
        }
    })
    return response.data ?? null
}

export const uploadFile = async (file: File, type: 'trailer' | 'card' | 'logo' | 'material'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/api/films/upload?type=${type}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })

    return response.data.path
}

export const getFilmsPage = async (limit: number, lastId: number): Promise<Film[]> => {
    const response = await api.get('/api/films', {
        params: { last_id: lastId, limit }
    })
    return response.data ?? []
}

export const createFilm = async (film: CreateFilmRequest): Promise<{ id: number }> => {
    const response = await api.post('/api/films', film) // response === undefined
    return response.data // TypeError: Cannot read properties of undefined (reading 'data')
}

// --- Справочники: жанры ---
export const getGenres = async (): Promise<Genre[]> => {
    const response = await api.get('/api/films/genres')
    return response.data ?? []
}
export const addGenre = async (genre: string): Promise<{ id: number }> => {
    const response = await api.post('/api/films/genres', JSON.stringify(genre), {
        headers: { 'Content-Type': 'application/json' }
    })
    return response.data
}

// --- Справочники: страны ---
export const getCountries = async (): Promise<Country[]> => {
    const response = await api.get('/api/films/countries')
    return response.data ?? []
}
export const addCountry = async (country: string): Promise<{ id: number }> => {
    const response = await api.post('/api/films/countries', JSON.stringify(country), {
        headers: { 'Content-Type': 'application/json' }
    })
    return response.data
}

// --- Справочники: роли ---
export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get('/api/films/roles')
    return response.data ?? []
}
export const addRole = async (role: string): Promise<{ id: number }> => {
    const response = await api.post('/api/films/roles', JSON.stringify(role), {
        headers: { 'Content-Type': 'application/json' }
    })
    return response.data
}

// --- Участники съёмок ---
export const searchFilmingMembers = async (query: string): Promise<Member[]> => {
    const response = await api.get('/api/films/filming-members/search', {
        params: { q: query }
    })
    return response.data ?? []
}
export const addFilmingMember = async (name: string): Promise<{ id: number }> => {
    const response = await api.post('/api/films/filming-members', JSON.stringify(name), {
        headers: { 'Content-Type': 'application/json' }
    })
    return response.data
}
