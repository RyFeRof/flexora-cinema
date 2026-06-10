import { useState } from "react";
import { uploadFile, createFilm } from "../../api";
import type { Film } from "../../types";

export default function Add(){
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSerial, setIsSerial] = useState(false)
    const [trailerFile, setTrailerFile] = useState<File | null>(null)
    const [cardFile, setCardFile]  = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [isHorizontal, setIsHorizontal] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [succes, setSucces] = useState<string | null>(null)
    
    const handleSubmit = async () => {
        if(!title.trim()) {
            setError('Укажите название фильма')
            return
        }
        if (!trailerFile || !cardFile || !logoFile) {
            setError('Не хватает каких файлов из следующего перечня: (trailer, card, logo)')
            return
        }
        setLoading(true)
        try {
            const [trailerPath, cardPath, logoPath] = await Promise.all([
                uploadFile(trailerFile, 'trailer'),
                uploadFile(cardFile, 'card'),
                uploadFile(logoFile, 'logo'),
            ])

            const film: Film = {
                id: null,
                title: title.trim(),
                is_serial: isSerial,
                description: description.trim() || null,
                trailer: { id: null, path: trailerPath },
                card: { id: null, is_horizontal: isHorizontal, path: cardPath },
                logo: { id: null, path: logoPath }, 
            }
            const { id } = await createFilm(film)
            setSucces(`Добавление фильма прошло успешно! Id фильма ${id}`)
        }
        catch (e) {
            console.error(e)
            setError('Не удалось сохранить фильм в бд')
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen min-w-screen bg-black text-white">
            <div className="mx-auto max-w-3xl px-6 py-10 bg-mist-900 rounded-2xl">
                <h1 className="text-2xl mb-8 font-semibold mx-auto text-center">Добавление фильма</h1>
                <div>
                    <div className="flex flex-col gap-6 mb-6">
                        <label className="flex flex-col gap-3">
                            <p className="text-sm text-gray-400">Название фильма</p>
                            <input placeholder="title" value={ title }
                                className="rounded-lg py-1.5 px-1 border border-gray-700 bg-gray-900 outline-none focus:border-gray-400"
                                onChange={ (e) => setTitle(e.target.value) } />
                        </label>
                    </div>
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col gap-3">
                            <p className="text-sm text-gray-400">Название фильма</p>
                            <input placeholder="title" value={ title }
                                className="rounded-lg py-1.5 px-1 border border-gray-700 bg-gray-900 outline-none focus:border-gray-400"
                                onChange={ (e) => setTitle(e.target.value) } />
                        </label>
                    </div>
                </div>
            </div> 
        </div>
    )
}
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODEyODE5MDcsInVzZXJfaWQiOjEwMDA2fQ.MzMkPF1wt8tvJN6K-22bDdmSaJHl_4lLEEewY2f7fEo