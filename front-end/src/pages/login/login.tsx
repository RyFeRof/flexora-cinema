import { useState } from "react";

export default function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    return (
        <div>
            <h1>Login</h1>
        </div>
    )
}