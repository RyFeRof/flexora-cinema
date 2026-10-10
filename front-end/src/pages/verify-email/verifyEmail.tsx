import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../../assets/voidex-logo.png"
import {
    VerifyEmailForm,
    clearPendingEmail,
    getPendingEmail,
    sendVerificationCode,
    setPendingEmail,
} from "../../features/verify-email"
import { getApiErrorMessage } from "../../shared/lib/apiError"
import { validateMail } from "../../validator/validator"

interface Props {
    onVerified: () => void
}

interface LocationState {
    email?: string
    codeSent?: boolean // регистрация уже отправила код — повторно не шлём
}

export default function VerifyEmailPage({ onVerified }: Props) {
    const navigate = useNavigate()
    const state = (useLocation().state ?? {}) as LocationState

    const [email, setEmail] = useState<string | null>(state.email ?? getPendingEmail())
    const [codeSent, setCodeSent] = useState(Boolean(state.codeSent))

    // шаг «ввести почту» (пришли с логина или перезагрузили страницу без данных)
    const [draft, setDraft] = useState("")
    const [draftError, setDraftError] = useState("")
    const [sending, setSending] = useState(false)

    const requestCode = async () => {
        const value = draft.trim().toLowerCase()
        const invalid = validateMail(value)
        if (invalid) { setDraftError(invalid); return }
        setSending(true)
        setDraftError("")
        try {
            await sendVerificationCode(value)
            setPendingEmail(value)
            setEmail(value)
            setCodeSent(true)
        } catch (e) {
            setDraftError(getApiErrorMessage(e, "Не удалось отправить код"))
        } finally {
            setSending(false)
        }
    }

    const handleVerified = () => {
        clearPendingEmail()
        onVerified()
        navigate("/", { replace: true })
    }

    return (
        <div className="flex justify-center min-h-screen min-w-screen bg-pageColor">
            <div className="flex flex-col items-center">
                <img src={logo} alt="Voidex" className="max-w-2xs align-middle items-center my-15" />
                <div className="flex flex-col bg-cardColor min-w-xl border border-gray-950 py-10 px-6 rounded-3xl text-textColor text-lg font-extralight">
                    <div className="flex flex-col gap-0.5 mb-6">
                        <h1 className="font-semibold text-title text-3xl">Подтверждение почты</h1>
                        {email ? (
                            <p>Мы отправили 6-значный код на <span className="text-title">{email}</span></p>
                        ) : (
                            <p>Укажите почту, с которой регистрировались — отправим код</p>
                        )}
                    </div>

                    {email ? (
                        <VerifyEmailForm
                            email={email}
                            initialCooldown={codeSent ? 60 : 0}
                            onVerified={handleVerified}
                        />
                    ) : (
                        <>
                            <div className="mb-6">
                                <label className="flex flex-col gap-1">
                                    <p>EMAIL</p>
                                    <input
                                        autoFocus
                                        type="email"
                                        placeholder="user@email.com"
                                        value={draft}
                                        disabled={sending}
                                        onChange={(e) => { setDraft(e.target.value); if (draftError) setDraftError("") }}
                                        onKeyDown={(e) => { if (e.key === "Enter") void requestCode() }}
                                        className={`rounded-lg py-3 px-2 border ${draftError ? "border-error" : "border-cardColor/70"} bg-inputColor outline-none focus:border-accent disabled:opacity-60`}
                                    />
                                </label>
                                {draftError && <p role="alert" className="mt-1 text-error">{draftError}</p>}
                            </div>
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void requestCode()}
                                className="text-title cursor-pointer mb-4 text-2xl font-semibold py-3.5 px-4 rounded-2xl border-stroke border-2 transition-colors hover:border-accent disabled:opacity-50"
                            >
                                {sending ? "Отправляем…" : "Получить код"}
                            </button>
                        </>
                    )}

                    <div className="mt-4 flex gap-1 justify-center">
                        <Link to="/login" onClick={clearPendingEmail}>
                            <p className="text-accent underline underline-offset-3">Вернуться ко входу</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
