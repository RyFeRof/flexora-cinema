interface Props {
    label: string;
    accept: string;
    fileName: string | null;
    uploading: boolean;
    uploadedPath: string | null;
    onSelect: (file: File) => void;
}

export default function FileDropzone({ label, accept, fileName, uploading, uploadedPath, onSelect }: Props) {
    return (
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stroke bg-inputColor/40 px-4 py-4 text-center transition-colors hover:border-textColor hover:bg-inputColor">
            <p className="text-base font-medium text-title">{label}</p>
            <p
                className={`max-w-full truncate text-xs ${
                    uploadedPath ? "text-green-400" : uploading ? "text-accent" : "text-textColor"
                }`}
            >
                {uploading
                    ? "Загрузка..."
                    : uploadedPath
                    ? fileName ?? "Загружено"
                    : "Нажми, чтобы выбрать файл"}
            </p>
            <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSelect(f);
                }}
            />
        </label>
    );
}
