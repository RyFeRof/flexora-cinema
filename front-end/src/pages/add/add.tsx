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
        <div className="flex justify-center items-center py-4 min-h-screen min-w-screen  bg-black text-white">
            <div className=" mx-auto max-w-3xl px-6 py-10 bg-mist-900/80 rounded-2xl border border-gray-800 ">
                <h1 className="text-2xl mb-8 font-semibold mx-auto text-center">Добавление фильма</h1>
                <div className="flex flex-col gap-6">
                    {/* Название */}
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col gap-3">
                            <p className="text-sm text-gray-400">Название фильма</p>
                            <input placeholder="title" value={ title }
                                className="rounded-lg py-3 px-2 border border-gray-700 bg-gray-900 outline-none focus:border-gray-400"
                                onChange={ (e) => setTitle(e.target.value) } />
                        </label>
                    </div>
                    {/* Описание */}
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col gap-3">
                            <p className="text-sm text-gray-400">Описание</p>
                            <textarea placeholder="description" value={ description } rows={ 4 }
                                className="resize-none rounded-lg py-1.5 px-2 border border-gray-700 bg-gray-900 outline-none focus:border-gray-400"
                                onChange={ (e) => setDescription(e.target.value) } />
                        </label>
                    </div>
                    {/* Чекбоксы */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2.5">
                            <input type="checkbox" checked={isSerial} onChange={ (e) => setIsSerial(e.target.checked)} />
                            <span className="text-sm text-gray-400">Сериал</span>
                        </label>
                        <label className="flex items-center gap-2.5">
                            <input type="checkbox" checked={isHorizontal} onChange={ (e) => setIsHorizontal(e.target.checked)} />
                            <span className="text-sm text-gray-400">Горизонтальный постер</span>
                        </label>
                    </div>
                    {/* Файлы */}
                    <div className="grid grid-cols-3 gap-6">
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 max-w-3xs  rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 px-4 py-4 text-center transition-colors hover:border-gray-500 hover:bg-gray-900 ">
                                <p className="text-lg text-gray-300 font-medium ">Постер</p>
                                <p className={`max-w-full truncate text-xs ${cardFile ? 'text-green-400' : 'text-gray-500'}`}>{cardFile ? cardFile.name : 'Нажми, чтобы выбрать изображение'}</p>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => (setCardFile(e.target.files?.[0] ?? null))} />
                            </label>
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 max-w-3xs  rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 px-4 py-4 text-center transition-colors hover:border-gray-500 hover:bg-gray-900 ">
                                <p className="text-lg text-gray-300 font-medium ">Логотип</p>
                                <p className={`max-w-full truncate text-xs ${logoFile ? 'text-green-400' : 'text-gray-500'}`}>{logoFile ? logoFile.name : 'Нажми, чтобы выбрать изображение'}</p>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => (setLogoFile(e.target.files?.[0] ?? null))} />
                            </label>
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 max-w-3xs  rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 px-4 py-4 text-center transition-colors hover:border-gray-500 hover:bg-gray-900 ">
                                <p className="text-lg text-gray-300 font-medium ">Трейлер</p>
                                <p className={`max-w-full truncate text-xs ${trailerFile ? 'text-green-400' : 'text-gray-500'}`}>{trailerFile ? trailerFile.name : 'Нажми, чтобы выбрать изображение'}</p>
                                <input type="file" accept="video/*" className="hidden" onChange={(e) => (setTrailerFile(e.target.files?.[0] ?? null))} />
                            </label>
                    </div>
                    {/* Баннеры */}
                    { error && <div className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-400">{ error }</div> }
                    { succes && <div className="rounded-lg bg-green-500/15 px-4 py-3 text-sm text-green-400">{ succes }</div> }
                    {/*  Кнопки */}
                    <button
                        onClick={ handleSubmit }
                        disabled={ loading }
                        className="max-w-full rounded-lg bg-white px-6 py-4 font-medium text-black text-lg hover:bg-gray-200 disabled:opacity-50">
                            Добавить фильм
                    </button>
                </div>
                
            </div> 
        </div>
    )
}
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODEyODE5MDcsInVzZXJfaWQiOjEwMDA2fQ.MzMkPF1wt8tvJN6K-22bDdmSaJHl_4lLEEewY2f7fEo