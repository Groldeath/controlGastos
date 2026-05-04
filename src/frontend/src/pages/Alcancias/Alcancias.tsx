import React, { useState, useEffect } from 'react';
import { AlcanciaService, type Alcancia } from '../../services/alcanciaService';
import Modal from '../../components/ui/Modal';
import { Loader2, Plus, Edit2, Trash2, Check, X, PiggyBank, ArrowDownCircle, ArrowUpCircle, Wallet, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Alcancias.module.css';

const Alcancias: React.FC = () => {
    const [alcancias, setAlcancias] = useState<Alcancia[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTipo, setNewTipo] = useState<'ahorro' | 'fondo'>('ahorro');
    const [newObjetivo, setNewObjetivo] = useState('');
    const [newMontoInicial, setNewMontoInicial] = useState('');
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editObjetivo, setEditObjetivo] = useState('');
    const [editMontoInicial, setEditMontoInicial] = useState('');

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const [isMovModalOpen, setMovModalOpen] = useState(false);
    const [movAlcancia, setMovAlcancia] = useState<Alcancia | null>(null);
    const [movMonto, setMovMonto] = useState('');
    const [movTipo, setMovTipo] = useState<'depositar' | 'retirar'>('depositar');
    const [movLoading, setMovLoading] = useState(false);

    const [error, setError] = useState('');

    const fetchAlcancias = async () => {
        setLoading(true);
        try {
            const res = await AlcanciaService.getAll();
            setAlcancias(res);
        } catch {
            setError('Error cargando alcancías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlcancias();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        if (newTipo === 'fondo' && (!newMontoInicial || parseFloat(newMontoInicial) <= 0)) {
            setError('El monto inicial es obligatorio para un fondo');
            return;
        }
        setCreating(true);
        setError('');
        try {
            await AlcanciaService.create({
                nombre: newName.trim(),
                tipo: newTipo,
                saldo_objetivo: newTipo === 'ahorro' && newObjetivo && parseFloat(newObjetivo) > 0 ? parseFloat(newObjetivo) : undefined,
                monto_inicial: newTipo === 'fondo' ? parseFloat(newMontoInicial) : undefined
            });
            setCreateModalOpen(false);
            setNewName('');
            setNewTipo('ahorro');
            setNewObjetivo('');
            setNewMontoInicial('');
            fetchAlcancias();
        } catch (err: any) {
            setError(err.message || 'Error creando alcancía');
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = () => {
        setNewName('');
        setNewTipo('ahorro');
        setNewObjetivo('');
        setNewMontoInicial('');
        setError('');
        setCreateModalOpen(true);
    };

    const startEditing = (a: Alcancia) => {
        setEditingId(a.id);
        setEditName(a.nombre);
        setEditObjetivo(a.saldo_objetivo ? a.saldo_objetivo.toString() : '');
        setEditMontoInicial(a.monto_inicial ? a.monto_inicial.toString() : '');
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }
        setError('');
        try {
            const objVal = editObjetivo ? parseFloat(editObjetivo) : null;
            const montoIniVal = editMontoInicial ? parseFloat(editMontoInicial) : undefined;
            const res = await AlcanciaService.update(id, {
                nombre: editName.trim(),
                saldo_objetivo: objVal && objVal > 0 ? objVal : null,
                monto_inicial: montoIniVal && montoIniVal > 0 ? montoIniVal : undefined
            });
            setAlcancias(alcancias.map(a => a.id === id ? { ...res } : a));
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Error actualizando alcancía');
        }
    };

    const handleDelete = async (id: number) => {
        setError('');
        try {
            await AlcanciaService.delete(id);
            setAlcancias(alcancias.filter(a => a.id !== id));
            setDeleteConfirmId(null);
        } catch (err: any) {
            setError(err.message || 'Error eliminando alcancía');
        }
    };

    const openMovModal = (a: Alcancia, tipo: 'depositar' | 'retirar') => {
        setMovAlcancia(a);
        setMovTipo(tipo);
        setMovMonto('');
        setError('');
        setMovModalOpen(true);
    };

    const handleMov = async () => {
        if (!movAlcancia || !movMonto || parseFloat(movMonto) <= 0) return;
        setMovLoading(true);
        setError('');
        try {
            const monto = parseFloat(movMonto);
            let res;
            if (movTipo === 'depositar') {
                res = await AlcanciaService.depositar(movAlcancia.id, monto);
            } else {
                res = await AlcanciaService.retirar(movAlcancia.id, monto);
            }
            setAlcancias(alcancias.map(a => a.id === movAlcancia.id ? { ...res } : a));
            setMovModalOpen(false);
            setMovAlcancia(null);
        } catch (err: any) {
            setError(err.message || 'Error en la operación');
        } finally {
            setMovLoading(false);
        }
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const ahorros = alcancias.filter(a => a.tipo === 'ahorro');
    const fondos = alcancias.filter(a => a.tipo === 'fondo');

    const renderAhorroCard = (a: Alcancia) => {
        const tieneObjetivo = a.saldo_objetivo && a.saldo_objetivo > 0;
        const percentage = tieneObjetivo ? Math.min((a.saldo_actual / a.saldo_objetivo!) * 100, 100) : 0;
        const remaining = tieneObjetivo ? a.saldo_objetivo! - a.saldo_actual : 0;
        const isEditing = editingId === a.id;
        const isDeleting = deleteConfirmId === a.id;

        return (
            <div key={a.id} className={styles.card}>
                <div className={styles.cardHeader}>
                    {isEditing ? (
                        <div className={styles.editRow}>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.editInput} autoFocus />
                            <div className={styles.editFields}>
                                <input type="number" step="0.01" value={editObjetivo} onChange={(e) => setEditObjetivo(e.target.value)} className={styles.editInputNumber} placeholder="Objetivo (opcional)" />
                            </div>
                            <div className={styles.editActions}>
                                <button className={styles.iconBtnSuccess} onClick={() => handleUpdate(a.id)} aria-label="Guardar"><Check size={16} aria-hidden="true" /></button>
                                <button className={styles.iconBtnCancel} onClick={() => setEditingId(null)} aria-label="Cancelar"><X size={16} aria-hidden="true" /></button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.cardTitleRow}>
                                <span className={styles.cardTitle}>{a.nombre}</span>
                            </div>
                            {isDeleting ? (
                                <div className={styles.actions}>
                                    <button className={styles.iconBtnSuccess} onClick={() => handleDelete(a.id)} aria-label="Confirmar eliminar"><Check size={16} aria-hidden="true" /></button>
                                    <button className={styles.iconBtnCancel} onClick={() => setDeleteConfirmId(null)} aria-label="Cancelar"><X size={16} aria-hidden="true" /></button>
                                </div>
                            ) : (
                                <div className={styles.actions}>
                                    <button className={styles.iconBtn} onClick={() => startEditing(a)} aria-label="Editar"><Edit2 size={16} aria-hidden="true" /></button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => setDeleteConfirmId(a.id)} aria-label="Eliminar"><Trash2 size={16} aria-hidden="true" /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!isEditing && (
                    <div className={styles.balanceSection}>
                        <div className={styles.balanceRow}>
                            <Wallet size={20} className={styles.balanceIcon} />
                            <span className={styles.balanceAmount}>${formatCurrency(a.saldo_actual)}</span>
                        </div>

                        {tieneObjetivo && (
                            <>
                                <div className={styles.progressLabels}>
                                    <span>Objetivo: ${formatCurrency(a.saldo_objetivo!)}</span>
                                    <span>{percentage.toFixed(1)}%</span>
                                </div>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{ width: `${percentage}%`, backgroundColor: a.color_hex }} />
                                </div>
                            </>
                        )}

                        {tieneObjetivo && remaining <= 0 && (
                            <div className={styles.goalReached}>¡Objetivo alcanzado!</div>
                        )}

                        <div className={styles.movActions}>
                            <button className={styles.depositBtn} onClick={() => openMovModal(a, 'depositar')}>
                                <ArrowDownCircle size={18} /> Depositar
                            </button>
                            <button className={styles.withdrawBtn} onClick={() => openMovModal(a, 'retirar')} disabled={a.saldo_actual <= 0}>
                                <ArrowUpCircle size={18} /> Retirar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFondoCard = (a: Alcancia) => {
        const presupuesto = a.monto_inicial || 0;
        const gastado = presupuesto - a.saldo_actual;
        const percentage = presupuesto > 0 ? Math.min((gastado / presupuesto) * 100, 100) : 0;
        const isEditing = editingId === a.id;
        const isDeleting = deleteConfirmId === a.id;

        return (
            <div key={a.id} className={`${styles.card} ${styles.cardFondo}`}>
                <div className={styles.cardHeader}>
                    {isEditing ? (
                        <div className={styles.editRow}>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.editInput} autoFocus />
                            <div className={styles.editFields}>
                                <input type="number" step="0.01" value={editMontoInicial} onChange={(e) => setEditMontoInicial(e.target.value)} className={styles.editInputNumber} placeholder="Presupuesto" />
                            </div>
                            <div className={styles.editActions}>
                                <button className={styles.iconBtnSuccess} onClick={() => handleUpdate(a.id)} aria-label="Guardar"><Check size={16} aria-hidden="true" /></button>
                                <button className={styles.iconBtnCancel} onClick={() => setEditingId(null)} aria-label="Cancelar"><X size={16} aria-hidden="true" /></button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.cardTitleRow}>
                                <span className={styles.cardTitle}>{a.nombre}</span>
                            </div>
                            {isDeleting ? (
                                <div className={styles.actions}>
                                    <button className={styles.iconBtnSuccess} onClick={() => handleDelete(a.id)} aria-label="Confirmar eliminar"><Check size={16} aria-hidden="true" /></button>
                                    <button className={styles.iconBtnCancel} onClick={() => setDeleteConfirmId(null)} aria-label="Cancelar"><X size={16} aria-hidden="true" /></button>
                                </div>
                            ) : (
                                <div className={styles.actions}>
                                    <button className={styles.iconBtn} onClick={() => startEditing(a)} aria-label="Editar"><Edit2 size={16} aria-hidden="true" /></button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => setDeleteConfirmId(a.id)} aria-label="Eliminar"><Trash2 size={16} aria-hidden="true" /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!isEditing && (
                    <div className={styles.balanceSection}>
                        <div className={styles.fondoStats}>
                            <div className={styles.fondoStat}>
                                <span className={styles.fondoStatLabel}>Presupuesto</span>
                                <span className={styles.fondoStatValue}>${formatCurrency(presupuesto)}</span>
                            </div>
                            <div className={styles.fondoStat}>
                                <span className={styles.fondoStatLabel}>Disponible</span>
                                <span className={styles.fondoStatValueDisponible}>${formatCurrency(a.saldo_actual)}</span>
                            </div>
                        </div>

                        <div className={styles.progressLabels}>
                            <span>Gastado: ${formatCurrency(gastado)}</span>
                            <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className={styles.progressTrack}>
                            <div className={styles.progressBar} style={{ width: `${percentage}%`, backgroundColor: '#f59e0b' }} />
                        </div>

                        <div className={styles.movActions}>
                            <button className={styles.withdrawBtn} onClick={() => openMovModal(a, 'retirar')} disabled={a.saldo_actual <= 0} style={{ flex: 1 }}>
                                <ArrowUpCircle size={18} /> Retirar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Alcancías</h1>
                <div className={styles.headerActions}>
                    <button className={styles.addBtn} onClick={openCreateModal}>
                        <Plus size={20} />
                        Nueva Alcancía
                    </button>
                </div>
            </div>

            {error && <div className={styles.errorAlert} role="alert">{error}</div>}

            {loading ? (
                <div className={styles.loader}>
                    <Loader2 className={styles.spinner} size={36} />
                </div>
            ) : alcancias.length === 0 ? (
                <div className={styles.emptyState}>
                    <PiggyBank size={48} className={styles.emptyIcon} />
                    <p>No tienes alcancías todavía.</p>
                    <p>Crea una para empezar a apartar dinero.</p>
                </div>
            ) : (
                <>
                    {ahorros.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <PiggyBank size={20} />
                                Ahorro
                            </h2>
                            <motion.div className={styles.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                {ahorros.map(a => renderAhorroCard(a))}
                            </motion.div>
                        </div>
                    )}

                    {fondos.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <Landmark size={20} />
                                Fondo
                            </h2>
                            <motion.div className={styles.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                {fondos.map(a => renderFondoCard(a))}
                            </motion.div>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => { setCreateModalOpen(false); setError(''); }} title="Nueva Alcancía">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div className={styles.errorAlert} role="alert">{error}</div>}

                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                        <div className={styles.tipoSelector}>
                            <button
                                type="button"
                                className={`${styles.tipoBtn} ${newTipo === 'ahorro' ? styles.tipoBtnActive : ''}`}
                                onClick={() => setNewTipo('ahorro')}
                            >
                                <PiggyBank size={18} />
                                Ahorro
                            </button>
                            <button
                                type="button"
                                className={`${styles.tipoBtn} ${newTipo === 'fondo' ? styles.tipoBtnActive : ''}`}
                                onClick={() => setNewTipo('fondo')}
                            >
                                <Landmark size={18} />
                                Fondo
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nombre</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ej. Vacaciones, Auto nuevo..."
                            style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                        />
                    </div>

                    {newTipo === 'ahorro' ? (
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Objetivo (opcional)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newObjetivo}
                                onChange={(e) => setNewObjetivo(e.target.value)}
                                placeholder="0.00"
                                style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                    ) : (
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Monto inicial</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={newMontoInicial}
                                onChange={(e) => setNewMontoInicial(e.target.value)}
                                placeholder="0.00"
                                style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                    )}

                    <button
                        className={styles.addBtn}
                        style={{ justifyContent: 'center', width: '100%' }}
                        onClick={handleCreate}
                        disabled={creating || !newName.trim()}
                    >
                        {creating ? <Loader2 className={styles.spinner} size={20} /> : <Plus size={20} />}
                        Crear Alcancía
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={isMovModalOpen}
                onClose={() => { setMovModalOpen(false); setMovAlcancia(null); setError(''); }}
                title={movAlcancia ? `${movTipo === 'depositar' ? 'Depositar en' : 'Retirar de'} ${movAlcancia.nombre}` : ''}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div className={styles.errorAlert} role="alert">{error}</div>}
                    {movAlcancia && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Saldo actual: <strong style={{ color: 'var(--text-primary)' }}>${formatCurrency(movAlcancia.saldo_actual)}</strong>
                        </div>
                    )}
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={movMonto}
                            onChange={(e) => setMovMonto(e.target.value)}
                            placeholder="0.00"
                            style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                        />
                    </div>
                    <button
                        className={movTipo === 'depositar' ? styles.depositBtn : styles.withdrawBtn}
                        style={{ justifyContent: 'center', width: '100%' }}
                        onClick={handleMov}
                        disabled={movLoading || !movMonto || parseFloat(movMonto) <= 0}
                    >
                        {movLoading ? <Loader2 className={styles.spinner} size={20} /> : movTipo === 'depositar' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                        {movTipo === 'depositar' ? 'Depositar' : 'Retirar'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Alcancias;
