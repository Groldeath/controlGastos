import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { Loader2, Plus, Edit2, Trash2, Check, X, CreditCard as CardIcon } from 'lucide-react';
import styles from './CreditCardModal.module.css';

interface CreditCard {
    id: number;
    nombre: string;
    dia_corte: number;
    dia_pago: number;
}

interface CreditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialForm = {
    nombre: '',
    dia_corte: '',
    dia_pago: ''
};

const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose }) => {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Create state
    const [formData, setFormData] = useState(initialForm);
    const [creating, setCreating] = useState(false);

    // Edit and Delete state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState(initialForm);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const totalPages = Math.ceil(cards.length / itemsPerPage) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [cards.length, currentPage, totalPages]);

    useEffect(() => {
        if (isOpen) {
            loadCards();
            setError('');
            setFormData(initialForm);
            setEditingId(null);
            setConfirmDeleteId(null);
            setCurrentPage(1);
        }
    }, [isOpen]);

    const loadCards = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/api/credit-cards');
            setCards(res);
        } catch (err: any) {
            setError('Error al cargar tarjetas de crédito');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { nombre, dia_corte, dia_pago } = formData;
        if (!nombre || !dia_corte || !dia_pago) {
            setError('Todos los campos son obligatorios');
            return;
        }

        setCreating(true);
        setError('');
        try {
            const res = await fetchApi('/api/credit-cards', {
                method: 'POST',
                data: {
                    nombre: nombre.trim(),
                    dia_corte: parseInt(dia_corte, 10),
                    dia_pago: parseInt(dia_pago, 10)
                }
            });
            setCards([...cards, res]);
            setFormData(initialForm);
        } catch (err: any) {
            setError(err.message || 'Error al crear la tarjeta');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        setError('');
        try {
            await fetchApi(`/api/credit-cards/${id}`, { method: 'DELETE' });
            setCards(cards.filter(c => c.id !== id));
        } catch (err: any) {
            const msg = err.message || 'Error al eliminar';
            setError(msg);
            alert("Delete Error: " + msg);
        }
    };

    const startEditing = (card: CreditCard) => {
        setEditingId(card.id);
        setEditForm({
            nombre: card.nombre,
            dia_corte: card.dia_corte.toString(),
            dia_pago: card.dia_pago.toString()
        });
    };

    const handleUpdate = async (id: number) => {
        const { nombre, dia_corte, dia_pago } = editForm;
        if (!nombre || !dia_corte || !dia_pago) {
            setError('Todos los campos son obligatorios para actualizar');
            return;
        }

        setError('');
        try {
            const res = await fetchApi(`/api/credit-cards/${id}`, {
                method: 'PUT',
                data: {
                    nombre: nombre.trim(),
                    dia_corte: parseInt(dia_corte, 10),
                    dia_pago: parseInt(dia_pago, 10)
                }
            });
            setCards(cards.map(c => c.id === id ? res : c));
            setEditingId(null);
        } catch (err: any) {
            const msg = err.message || 'Error al actualizar';
            setError(msg);
            alert("Update Error: " + msg);
        }
    };

    const paginatedCards = cards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Administrar Tarjetas de Crédito">
            <div className={styles.container}>
                {error && <div className={styles.errorAlert}>{error}</div>}

                {/* Formulario de Creación */}
                <form className={styles.addForm} onSubmit={handleCreate}>
                    <div className={styles.formRow}>
                        <input
                            type="text"
                            placeholder="Nombre de la Tarjeta"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className={styles.input}
                            disabled={creating}
                        />

                    </div>
                    <div className={styles.formRow}>
                        <input
                            type="number"
                            placeholder="Día Corte"
                            value={formData.dia_corte}
                            onChange={(e) => setFormData({ ...formData, dia_corte: e.target.value })}
                            className={styles.input}
                            disabled={creating}
                            min="1"
                            max="31"
                        />
                        <input
                            type="number"
                            placeholder="Día Pago"
                            value={formData.dia_pago}
                            onChange={(e) => setFormData({ ...formData, dia_pago: e.target.value })}
                            className={styles.input}
                            disabled={creating}
                            min="1"
                            max="31"
                        />
                        <button type="submit" className={styles.addBtn} disabled={creating}>
                            {creating ? <Loader2 size={18} className={styles.spinner} /> : <Plus size={18} />}
                            <span>Añadir</span>
                        </button>
                    </div>
                </form>

                {/* Lista de Tarjetas */}
                <div className={styles.listContainer}>
                    {loading ? (
                        <div className={styles.loaderCenter}>
                            <Loader2 size={24} className={styles.spinner} />
                        </div>
                    ) : cards.length === 0 ? (
                        <div className={styles.emptyState}>
                            <CardIcon size={32} className={styles.emptyIcon} />
                            <p>No tienes tarjetas de crédito registradas.</p>
                        </div>
                    ) : (
                        <ul className={styles.cardList}>
                            {paginatedCards.map(card => (
                                <li key={card.id} className={styles.cardItem}>
                                    {editingId === card.id ? (
                                        <div className={styles.editRow}>
                                            <div className={styles.editInputsGroup}>
                                                <input
                                                    type="text"
                                                    value={editForm.nombre}
                                                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                                    className={styles.inputSmall}
                                                    placeholder="Nombre"
                                                />

                                                <input
                                                    type="number"
                                                    value={editForm.dia_corte}
                                                    onChange={(e) => setEditForm({ ...editForm, dia_corte: e.target.value })}
                                                    className={styles.inputSmall}
                                                    placeholder="Corte"
                                                />
                                                <input
                                                    type="number"
                                                    value={editForm.dia_pago}
                                                    onChange={(e) => setEditForm({ ...editForm, dia_pago: e.target.value })}
                                                    className={styles.inputSmall}
                                                    placeholder="Pago"
                                                />
                                            </div>
                                            <div className={styles.actionGroup}>
                                                <button type="button" className={styles.iconBtnSuccess} onClick={() => handleUpdate(card.id)}>
                                                    <Check size={16} />
                                                </button>
                                                <button type="button" className={styles.iconBtnCancel} onClick={() => setEditingId(null)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.cardInfoRow}>
                                            <div className={styles.cardDetails}>
                                                <span className={styles.cardName}>{card.nombre}</span>
                                                <div className={styles.cardSub}>
                                                    Corte: {card.dia_corte} | Pago: {card.dia_pago}
                                                </div>
                                            </div>
                                            {confirmDeleteId === card.id ? (
                                                <div className={styles.actionGroup}>
                                                    <button type="button" className={styles.iconBtnSuccess} onClick={() => handleDelete(card.id)} title="Confirmar borrado">
                                                        <Check size={16} />
                                                    </button>
                                                    <button type="button" className={styles.iconBtnDanger} onClick={() => setConfirmDeleteId(null)} title="Cancelar">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionGroup}>
                                                    <button type="button" className={styles.iconBtnEdit} onClick={() => startEditing(card)} title="Editar">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button type="button" className={styles.iconBtnDelete} onClick={() => setConfirmDeleteId(card.id)} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && cards.length > itemsPerPage && (
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

export default CreditCardModal;
