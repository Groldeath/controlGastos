import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { Loader2, UserPlus, Save } from 'lucide-react';
import styles from './UserModal.module.css';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('usuario');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Pre-poblar los datos si vamos a editar
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombreUsuario(initialData.nombre_usuario);
                setEmail(initialData.email);
                setPassword(''); // Vacío para no cambiarlo a menos que el usuario escriba algo
                setRol(initialData.rol);
            } else {
                setNombreUsuario('');
                setEmail('');
                setPassword('');
                setRol('usuario');
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nombreUsuario || !email || (!initialData && !password)) {
            setError('Faltan campos obligatorios');
            return;
        }

        if (password && password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSubmitting(true);

        try {
            const body: any = {
                nombre_usuario: nombreUsuario,
                email,
                rol
            };
            if (password) {
                body.password = password;
            }

            if (initialData) {
                await fetchApi(`/api/users/${initialData.id}`, {
                    method: 'PUT',
                    data: body
                });
            } else {
                await fetchApi('/api/users', {
                    method: 'POST',
                    data: body
                });
            }

            // Limpiar formulario y cerrar
            setNombreUsuario('');
            setEmail('');
            setPassword('');
            setRol('usuario');

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al crear el usuario');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Usuario" : "Crear Nuevo Usuario"}>
            <div className={styles.container}>
                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre de Usuario</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            placeholder="Ej: juanperez"
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej: juan@ejemplo.com"
                            autoComplete="off"
                            disabled={!!initialData} // Deshabilitado en edición
                            style={initialData ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Contraseña {initialData ? '(Opcional: Dejar en blanco para mantener la actual)' : ''}
                        </label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 caracteres"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Rol de Acceso</label>
                        <select
                            className={styles.select}
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                        >
                            <option value="usuario">Usuario Estándar</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <p className={styles.helpText}>
                            Los administradores pueden gestionar usuarios y ver todos los datos.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting || !nombreUsuario || !email || (!initialData && !password)}
                    >
                        {submitting ? (
                            <Loader2 size={18} className={styles.spinner} />
                        ) : (
                            initialData ? <Save size={18} /> : <UserPlus size={18} />
                        )}
                        {initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default UserModal;
