import axios from "axios";
import type { Film, Release} from "../types"
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
        isRefreshing=true
        try {
            const { data } = await axios.post(
                "/api/auth/refresh",
                {},
                { withCredentials: true}
            )
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
            isRefreshing=false
        }
    }
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

export const uploadFile = async (file: File, type: 'trailer' | 'card' | 'logo'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/api/films/upload?type=${type}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })

    return response.data.path
}

export const createFilm = async (film: Film): Promise<{ id: number }> => {
    const response = await api.post('/api/films', film)
    return response.data
}
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE1MzQ0MjIsInVzZXJfaWQiOjF9.fYKLIB8zI_ENeUAKMUqWI7fMq1s42877s7a3uNKm1fc
