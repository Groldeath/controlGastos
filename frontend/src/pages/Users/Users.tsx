import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { Plus, Users as UsersIcon, Loader2, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Users.module.css';
import UserModal from '../../components/modals/UserModal';

interface Usuario {
    id: number;
    nombre_usuario: string;
    email: string;
    rol: string;
    fecha_creacion: string;
}

const Users: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('/api/users');
            setUsuarios(data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await fetchApi(`/api/users/${id}`, { method: 'DELETE' });
            setDeleteConfirmId(null);
            loadUsers();
        } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            alert(error.message);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <UsersIcon size={28} />
                    Gestión de Usuarios
                </h1>
                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setUserToEdit(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={20} />
                    Crear Usuario
                </button>
            </div>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <Loader2 className={styles.spinner} size={40} />
                </div>
            ) : (
                <motion.div
                    className={styles.tableContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Fecha de Creación</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={styles.emptyState}>No hay usuarios registrados.</td>
                                </tr>
                            ) : (
                                usuarios.map((usr) => (
                                    <tr key={usr.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {usr.nombre_usuario.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={styles.userDetails}>
                                                    <span className={styles.userName}>{usr.nombre_usuario}</span>
                                                    <span className={styles.userEmail}>{usr.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${usr.rol === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                                                {usr.rol === 'admin' ? 'Administrador' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(usr.fecha_creacion).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            {deleteConfirmId === usr.id ? (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.iconBtnSuccess}
                                                        title="Confirmar"
                                                        onClick={() => handleDelete(usr.id)}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.iconBtnDanger}
                                                        title="Cancelar"
                                                        onClick={() => setDeleteConfirmId(null)}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.actionBtnEdit}
                                                        title="Editar"
                                                        onClick={() => {
                                                            setUserToEdit(usr);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionBtnDelete}
                                                        title="Eliminar"
                                                        onClick={() => setDeleteConfirmId(usr.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </motion.div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadUsers}
                initialData={userToEdit}
            />
        </div>
    );
};

export default Users;
