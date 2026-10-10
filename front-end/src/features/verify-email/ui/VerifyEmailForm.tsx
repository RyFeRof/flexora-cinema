import { useState } from "react"
import { sendVerificationCode, verifyEmail } from "../api/verifyEmail"
import { isValidCode } from "../lib/unverified"
import { useCooldown } from "../model/useCooldown"
import { getApiErrorMessage } from "../../../shared/lib/apiError"

interface Props {
    email: string
    initialCooldown?: number // >0, если код только что отправили (после регистрации)
    onVerified: () => void
}

const USER_FACING = [400, 401, 403] // verify-email отвечает 401 с понятным текстом

export default function VerifyEmailForm({ email, initialCooldown = 0, onVerified }: Props) {
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [info, setInfo] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [resending, setResending] = useState(false)
    const { left, start } = useCooldown(60, initialCooldown)

    const submit = async () => {
        if (verifying) return
        if (!isValidCode(code)) { setError("Введите 6 цифр из письма"); return }
        setVerifying(true)
        setError("")
        setInfo("")
        try {
            await verifyEmail(email, code)
            onVerified()
        } catch (e) {
            setError(getApiErrorMessage(e, "Не удалось подтвердить почту", USER_FACING))
            setVerifying(false)
        }
    }

    const resend = async () => {
        if (resending || left > 0) return
        setResending(true)
        setError("")
        setInfo("")
        try {
            await sendVerificationCode(email)
            setCode("")
            setInfo("Новый код отправлен")
            start()
        } catch (e) {
            setError(getApiErrorMessage(e, "Не удалось отправить код"))
        } finally {
            setResending(false)
        }
    }

    return (
        <>
            <div className="mb-6">
                <label className="flex flex-col gap-1">
                    <p>КОД ИЗ ПИСЬМА</p>
                    <input
                        autoFocus
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        disabled={verifying}
                        onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); if (error) setError("") }}
                        onKeyDown={(e) => { if (e.key === "Enter") void submit() }}
                        className={`rounded-lg py-3 px-2 border text-center text-3xl tracking-[0.5em] text-title ${error ? "border-error" : "border-cardColor/70"} bg-inputColor outline-none focus:border-accent disabled:opacity-60`}
                    />
                </label>
                {error && <p role="alert" className="mt-1 text-error">{error}</p>}
                {info && !error && <p className="mt-1 text-emerald-400">{info}</p>}
            </div>

            <button
                type="button"
                disabled={verifying || code.length !== 6}
                onClick={() => void submit()}
                className="text-title cursor-pointer mb-4 text-2xl font-semibold py-3.5 px-4 rounded-2xl border-stroke border-2 transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
                {verifying ? "Проверяем…" : "Подтвердить"}
            </button>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={() => void resend()}
                    disabled={resending || left > 0}
                    className="text-accent underline underline-offset-3 transition-colors hover:text-accent/80 disabled:cursor-default disabled:no-underline disabled:opacity-60"
                >
                    {resending ? "Отправляем…" : left > 0 ? `Отправить код снова через ${left} с` : "Отправить код снова"}
                </button>
            </div>
        </>
    )
}
