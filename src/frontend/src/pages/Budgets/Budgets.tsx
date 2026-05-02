import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BudgetService, type Budget } from '../../services/budgetService';
import Modal from '../../components/ui/Modal';
import { Loader2, Plus, Edit2, Trash2, Check, X, PieChart, Copy, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Budgets.module.css';

const Budgets: React.FC = () => {
    const { selectedMonth, selectedYear, refreshTrigger, refreshAvailableMonths } = useAppContext();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    // Create state
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit state (inline on card)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editLimit, setEditLimit] = useState('');

    // Delete state
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Transactions view modal
    const [isTxModalOpen, setTxModalOpen] = useState(false);
    const [txBudget, setTxBudget] = useState<Budget | null>(null);
    const [txList, setTxList] = useState<any[]>([]);
    const [txLoading, setTxLoading] = useState(false);

    // Error state
    const [error, setError] = useState('');

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const res = await BudgetService.getAll(selectedMonth, selectedYear);
            setBudgets(res);
        } catch (err: any) {
            setError('Error cargando presupuestos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, [selectedMonth, selectedYear, refreshTrigger]);

    const handleCreate = async () => {
        if (!newName.trim() || !newLimit || parseFloat(newLimit) <= 0) {
            setError('Nombre y monto son obligatorios');
            return;
        }
        setCreating(true);
        setError('');
        try {
            await BudgetService.create({
                nombre: newName.trim(),
                monto_limite: parseFloat(newLimit),
                mes: selectedMonth,
                anio: selectedYear
            });
            setCreateModalOpen(false);
            setNewName('');
            setNewLimit('');
            fetchBudgets();
            refreshAvailableMonths();
        } catch (err: any) {
            setError(err.message || 'Error creando presupuesto');
        } finally {
            setCreating(false);
        }
    };

    const handleClonePrevious = async () => {
        setError('');
        let prevMonth = selectedMonth - 1;
        let prevYear = selectedYear;
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear--;
        }
        try {
            const prevBudgets = await BudgetService.getAll(prevMonth, prevYear);
            if (prevBudgets.length === 0) {
                setError('No hay presupuestos del mes anterior para clonar');
                return;
            }
            const promises = prevBudgets.map((b: Budget) =>
                BudgetService.create({
                    nombre: b.nombre,
                    monto_limite: parseFloat(b.monto_limite as any),
                    mes: selectedMonth,
                    anio: selectedYear,
                    color_hex: b.color_hex
                })
            );
            await Promise.all(promises);
            fetchBudgets();
            refreshAvailableMonths();
        } catch (err: any) {
            setError(err.message || 'Error clonando presupuestos');
        }
    };

    const startEditing = (b: Budget) => {
        setEditingId(b.id);
        setEditName(b.nombre);
        setEditLimit(b.monto_limite.toString());
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim() || !editLimit || parseFloat(editLimit) <= 0) {
            setEditingId(null);
            return;
        }
        setError('');
        try {
            await BudgetService.update(id, {
                nombre: editName.trim(),
                monto_limite: parseFloat(editLimit)
            });
            setBudgets(budgets.map(b => b.id === id ? { ...b, nombre: editName.trim(), monto_limite: parseFloat(editLimit) } : b));
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Error actualizando presupuesto');
        }
    };

    const handleDelete = async (id: number) => {
        setError('');
        try {
            await BudgetService.delete(id);
            setBudgets(budgets.filter(b => b.id !== id));
            setDeleteConfirmId(null);
        } catch (err: any) {
            setError(err.message || 'Error eliminando presupuesto');
        }
    };

    const viewTransactions = async (b: Budget) => {
        setTxBudget(b);
        setTxModalOpen(true);
        setTxLoading(true);
        try {
            const res = await BudgetService.getTransactions(b.id);
            setTxList(res);
        } catch (err) {
            setTxList([]);
        } finally {
            setTxLoading(false);
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return '#ef4444';
        if (percentage >= 75) return '#f59e0b';
        return '#10b981';
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Presupuestos</h1>
                <div className={styles.headerActions}>
                    <button className={styles.cloneBtn} onClick={handleClonePrevious} title="Clonar presupuestos del mes anterior">
                        <Copy size={18} />
                        Clonar Anterior
                    </button>
                    <button className={styles.addBtn} onClick={() => setCreateModalOpen(true)}>
                        <Plus size={20} />
                        Nuevo Presupuesto
                    </button>
                </div>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            {loading ? (
                <div className={styles.loader}>
                    <Loader2 className={styles.spinner} size={36} />
                </div>
            ) : budgets.length === 0 ? (
                <div className={styles.emptyState}>
                    <PieChart size={48} className={styles.emptyIcon} />
                    <p>No tienes presupuestos para este mes.</p>
                    <p>Crea uno nuevo o clona los del mes anterior.</p>
                </div>
            ) : (
                <motion.div
                    className={styles.grid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {budgets.map((b) => {
                        const totalGastado = b.total_gastado || 0;
                        const limit = parseFloat(b.monto_limite as any);
                        const percentage = limit > 0 ? Math.min((totalGastado / limit) * 100, 100) : 0;
                        const progressColor = getProgressColor(percentage);
                        const remaining = limit - totalGastado;
                        const isEditing = editingId === b.id;
                        const isDeleting = deleteConfirmId === b.id;

                        return (
                            <div
                                key={b.id}
                                className={styles.card}
                                style={{ cursor: 'pointer' }}
                                onClick={() => !isEditing && !isDeleting && viewTransactions(b)}
                            >
                                <div className={styles.cardHeader} onClick={(e) => e.stopPropagation()}>
                                    {isEditing ? (
                                        <div className={styles.editRow}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={styles.editInput}
                                                autoFocus
                                            />
                                            <div className={styles.editFields}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editLimit}
                                                    onChange={(e) => setEditLimit(e.target.value)}
                                                    className={styles.editInputNumber}
                                                />
                                            </div>
                                            <div className={styles.actions}>
                                                <button className={styles.iconBtnSuccess} onClick={() => handleUpdate(b.id)}>
                                                    <Check size={16} />
                                                </button>
                                                <button className={styles.iconBtnCancel} onClick={() => setEditingId(null)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.cardTitle}>
                                                {b.nombre}
                                            </div>
                                            {isDeleting ? (
                                                <div className={styles.actions}>
                                                    <button className={styles.iconBtnSuccess} onClick={() => handleDelete(b.id)}>
                                                        <Check size={16} />
                                                    </button>
                                                    <button className={styles.iconBtnCancel} onClick={() => setDeleteConfirmId(null)}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.actions}>
                                                    <button className={styles.iconBtn} onClick={() => startEditing(b)} title="Editar">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => setDeleteConfirmId(b.id)} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {!isEditing && (
                                    <div className={styles.progressSection}>
                                        <div className={styles.progressLabels}>
                                            <span>
                                                Gastado: <span className={styles.spent}>${formatCurrency(totalGastado)}</span>
                                            </span>
                                            <span>
                                                Límite: ${formatCurrency(limit)}
                                            </span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressBar}
                                                style={{ width: `${percentage}%`, backgroundColor: progressColor }}
                                            />
                                        </div>
                                        <div className={styles.progressLabels} style={{ marginTop: '0.25rem' }}>
                                            <span style={{ color: progressColor, fontWeight: 600, fontSize: '0.8rem' }}>
                                                {percentage.toFixed(1)}%
                                            </span>
                                            <span style={{ fontSize: '0.8rem' }}>
                                                Restante: ${formatCurrency(Math.max(0, remaining))}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            )}

            {/* Create Budget Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setCreateModalOpen(false); setError(''); }} title="Nuevo Presupuesto">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div className={styles.errorAlert}>{error}</div>}
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nombre</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ej. Comida, Vacaciones..."
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)',
                                color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Monto Límite</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            placeholder="0.00"
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)',
                                color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        className={styles.addBtn}
                        style={{ justifyContent: 'center', width: '100%' }}
                        onClick={handleCreate}
                        disabled={creating || !newName.trim() || !newLimit || parseFloat(newLimit) <= 0}
                    >
                        {creating ? <Loader2 className={styles.spinner} size={20} /> : <Plus size={20} />}
                        Crear Presupuesto
                    </button>
                </div>
            </Modal>

            {/* Budget Transactions Modal */}
            <Modal isOpen={isTxModalOpen} onClose={() => { setTxModalOpen(false); setTxBudget(null); }} title={txBudget ? `Movimientos: ${txBudget.nombre}` : ''}>
                <div>
                    {txLoading ? (
                        <div className={styles.loader}>
                            <Loader2 className={styles.spinner} size={24} />
                        </div>
                    ) : txList.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            No hay movimientos asociados a este presupuesto.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {txList.map((tx: any) => (
                                <div
                                    key={tx.id}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.75rem', background: 'var(--bg-surface)',
                                        borderRadius: '0.5rem', border: '1px solid var(--border-color)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.descripcion}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(tx.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })}
                                            {tx.categoria_nombre && ` · ${tx.categoria_nombre}`}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <ArrowDownRight size={16} />
                                        ${Math.abs(parseFloat(tx.monto)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Budgets;
