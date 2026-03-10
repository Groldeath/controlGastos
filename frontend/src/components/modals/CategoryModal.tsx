import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { Loader2, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import styles from './CategoryModal.module.css';

interface Category {
    id: number;
    nombre: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Create state
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit and Delete state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [categories.length, currentPage, totalPages]);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            setError('');
            setNewCategoryName('');
            setEditingId(null);
            setConfirmDeleteId(null);
            setCurrentPage(1);
        }
    }, [isOpen]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/api/categories');
            setCategories(res);
        } catch (err: any) {
            setError('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setCreating(true);
        setError('');
        try {
            const res = await fetchApi('/api/categories', {
                method: 'POST',
                data: { nombre: newCategoryName.trim() }
            });
            setCategories([...categories, res]);
            setNewCategoryName('');
        } catch (err: any) {
            setError(err.message || 'Error al crear la categoría');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        setError('');
        try {
            await fetchApi(`/api/categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c.id !== id));
        } catch (err: any) {
            const msg = err.message || 'Error al eliminar';
            setError(msg);
            alert("Delete Error: " + msg);
        }
    };

    const startEditing = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.nombre);
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }
        setError('');
        try {
            const res = await fetchApi(`/api/categories/${id}`, {
                method: 'PUT',
                data: { nombre: editName.trim() }
            });
            setCategories(categories.map(c => c.id === id ? res : c));
            setEditingId(null);
        } catch (err: any) {
            const msg = err.message || 'Error al actualizar';
            setError(msg);
            alert("Update Error: " + msg);
        }
    };

    const paginatedCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Administrar Categorías">
            <div className={styles.container}>
                {error && <div className={styles.errorAlert}>{error}</div>}

                <form className={styles.addForm} onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Nueva categoría..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className={styles.input}
                        disabled={creating}
                    />
                    <button type="submit" className={styles.addBtn} disabled={!newCategoryName.trim() || creating}>
                        {creating ? <Loader2 size={18} className={styles.spinner} /> : <Plus size={18} />}
                        <span>Agregar</span>
                    </button>
                </form>

                <div className={styles.listContainer}>
                    {loading ? (
                        <div className={styles.loaderCenter}>
                            <Loader2 size={24} className={styles.spinner} />
                        </div>
                    ) : categories.length === 0 ? (
                        <p className={styles.emptyState}>No tienes categorías registradas.</p>
                    ) : (
                        <ul className={styles.categoryList}>
                            {paginatedCategories.map(cat => (
                                <li key={cat.id} className={styles.categoryItem}>
                                    {editingId === cat.id ? (
                                        <div className={styles.editRow}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={styles.inputSmall}
                                                autoFocus
                                            />
                                            <div className={styles.actionGroup}>
                                                <button type="button" className={styles.iconBtnSuccess} onClick={() => handleUpdate(cat.id)}>
                                                    <Check size={16} />
                                                </button>
                                                <button type="button" className={styles.iconBtnCancel} onClick={() => setEditingId(null)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={styles.categoryName}>{cat.nombre}</span>
                                            {confirmDeleteId === cat.id ? (
                                                <div className={styles.actionGroup}>
                                                    <button type="button" className={styles.iconBtnSuccess} onClick={() => handleDelete(cat.id)} title="Confirmar borrado">
                                                        <Check size={16} />
                                                    </button>
                                                    <button type="button" className={styles.iconBtnDanger} onClick={() => setConfirmDeleteId(null)} title="Cancelar">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionGroup}>
                                                    <button type="button" className={styles.iconBtnEdit} onClick={() => startEditing(cat)} title="Editar">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button type="button" className={styles.iconBtnDelete} onClick={() => setConfirmDeleteId(cat.id)} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && categories.length > itemsPerPage && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span className={styles.pageInfo}>
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CategoryModal;
