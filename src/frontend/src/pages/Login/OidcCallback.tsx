import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from './Login.module.css'; // Reutilizamos los estilos del login

const OidcCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processToken = async () => {
            const searchParams = new URLSearchParams(location.search);
            const token = searchParams.get('token');

            if (!token) {
                setError('No se recibió el token de autenticación. Redirigiendo al login...');
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            try {
                // Ahora debemos obtener el perfil del usuario para completar el login local
                // Usamos fetchApi manual ya que el token apenas lo tenemos en la URL
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${apiUrl}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener perfil del usuario validado');
                }

                const userData = await response.json();
                
                // Realizamos el login local con el auth context (guarda el token y el perfil)
                login(token, userData);
                navigate('/dashboard', { replace: true });
                
            } catch (err: any) {
                console.error(err);
                setError('Falló la validación del perfil. El acceso SSO no se completó.');
                setTimeout(() => navigate('/login'), 4000);
            }
        };

        processToken();
    }, [location, login, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />
            <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                {error ? (
                    <>
                        <AlertCircle size={48} color="var(--danger-color)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Error de Autenticación</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{error}</p>
                    </>
                ) : (
                    <>
                        <Loader2 className={styles.spinner} size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Completando Acceso</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Validando credenciales seguras de SSO...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OidcCallback;
