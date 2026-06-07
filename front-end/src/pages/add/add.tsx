import { useState } from "react";
import { uploadFile } from "../../api";

export default function Add(){
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSerial, setIsSerial] = useState(false)
    const [trailerFile, setTrailerFile] = useState<File | null>(null)
    const [cardFile, setCardFile]  = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
}