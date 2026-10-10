export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="rounded-xl border border-error/40 bg-error/10 p-4">
            <p role="alert" className="text-sm text-error">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-[10px] bg-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-title transition-colors hover:bg-[#333]"
            >
                Повторить
            </button>
        </div>
    )
}

export function RowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
    return (
        <div className="animate-pulse space-y-2" aria-busy="true" aria-label={label}>
            {Array.from({ length: rows }, (_, i) => <div key={i} className="h-[60px] rounded-xl bg-[#222]" />)}
        </div>
    )
}

export function SectionLabel({ children }: { children: string }) {
    return <p className="mt-6 mb-3 text-[11px] font-semibold tracking-[1px] text-[#777] first:mt-0">{children}</p>
}
