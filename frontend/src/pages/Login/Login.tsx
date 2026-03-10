import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../services/api';
import { Wallet, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import styles from './Login.module.css';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [isSetup, setIsSetup] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                // Check if there are any users in the DB
                const res = await fetchApi('/api/users/setup-status');
                setIsSetup(res.requireSetup);
            } catch (err) {
                console.error('Error al revisar el estado del setup', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, []);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSetup) {
                // Modo Setup: Creando el primer admin
                const res = await fetchApi('/api/users/setup', {
                    method: 'POST',
                    data: { nombre_usuario: username, email, password }
                });
                login(res.token, res.user);
            } else {
                // Modo Estándar: Login
                const res = await fetchApi('/api/users/login', {
                    method: 'POST',
                    data: { email, password }
                });
                login(res.token, res.user);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Decorativo */}
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <Wallet size={32} className={styles.logoIcon} />
                    </div>
                    <h1>Control de Gastos</h1>
                    <p className={styles.subtitle}>Toma el control de tus finanzas</p>
                </div>

                {checkingStatus ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 className={styles.spinner} size={32} color="var(--accent-primary)" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    className={styles.errorAlert}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isSetup && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={styles.inputGroup}
                                >
                                    <label>Usuario / Alias</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Ej. Luis Admin"
                                        required={isSetup}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={styles.inputGroup}>
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className={styles.spinner} size={20} />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    {isSetup ? 'Inicializar App' : 'Entrar al Dashboard'}
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
