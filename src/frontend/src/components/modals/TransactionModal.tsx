import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { Loader2, Send } from 'lucide-react';
import styles from './TransactionModal.module.css';
import Select from '../ui/Select';

interface Category {
    id: number;
    nombre: string;
}

interface CreditCard {
    id: number;
    nombre: string;
}

interface Budget {
    id: number;
    nombre: string;
}

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Optional callback to refresh data
    initialData?: any; // The transaction object if editing
}

type TipoTransaccion = 'gasto' | 'ingreso' | 'ahorro';

const hoyLocal = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
};

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(hoyLocal());
    const [descripcion, setDescripcion] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [tarjetaId, setTarjetaId] = useState('');
    const [presupuestoId, setPresupuestoId] = useState('');
    const [ahorroAction, setAhorroAction] = useState<'depositar' | 'retirar'>('depositar');

    const [categorias, setCategorias] = useState<Category[]>([]);
    const [tarjetas, setTarjetas] = useState<CreditCard[]>([]);
    const [presupuestos, setPresupuestos] = useState<Budget[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            if (initialData) {
                setTipo(initialData.tipo as TipoTransaccion);
                setMonto(Math.abs(parseFloat(initialData.monto)).toString());
                setFecha(new Date(initialData.fecha).toISOString().split('T')[0]);
                setDescripcion(initialData.descripcion);
                setCategoriaId(initialData.categoria?.id?.toString() || '');
                setTarjetaId(initialData.tarjeta?.id?.toString() || '');
                setPresupuestoId(initialData.presupuesto?.id?.toString() || '');
                setAhorroAction(parseFloat(initialData.monto) < 0 ? 'retirar' : 'depositar');
            } else {
                // Reset form
                setTipo('gasto');
                setMonto('');
                setFecha(hoyLocal());
                setDescripcion('');
                setCategoriaId('');
                setTarjetaId('');
                setPresupuestoId('');
                setAhorroAction('depositar');
            }
            setError('');
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            let m: number, y: number;
            if (initialData && initialData.fecha) {
                [y, m] = String(initialData.fecha).split('T')[0].split('-').map(Number);
            } else {
                const hoy = new Date();
                m = hoy.getMonth() + 1;
                y = hoy.getFullYear();
            }

            const [catsRes, cardsRes, budgetsRes] = await Promise.all([
                fetchApi('/api/categories'),
                fetchApi('/api/credit-cards'),
                fetchApi(`/api/presupuestos?mes=${m}&anio=${y}`)
            ]);
            setCategorias(catsRes);
            setTarjetas(cardsRes);
            setPresupuestos(budgetsRes);

            if (!initialData) {
                if (catsRes.length > 0) setCategoriaId(catsRes[0].id.toString());
                setTarjetaId('');
                setPresupuestoId('');
            }
        } catch (err: any) {
            setError('Error cargando datos: ' + err.message);
        } finally {
            setLoadingData(false);
        }
    };

    // Recargar presupuestos cuando cambia la fecha
    useEffect(() => {
        if (!isOpen || loadingData || !fecha) return;
        const [y, m] = fecha.split('-').map(Number);
        
        fetchApi(`/api/presupuestos?mes=${m}&anio=${y}`)
            .then(res => {
                setPresupuestos(res);
                // Si el presupuesto seleccionado ya no existe en el nuevo mes, limpiar
                if (presupuestoId && !res.find((b: any) => b.id.toString() === presupuestoId)) {
                    setPresupuestoId('');
                }
            })
            .catch(err => console.error('Error cargando presupuestos', err));
    }, [fecha]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!monto || !fecha || !descripcion) {
            setError('Monto, Fecha y Descripción son obligatorios');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const finalMonto = parseFloat(monto);
            const body: any = {
                tipo,
                monto: tipo === 'ahorro' && ahorroAction === 'retirar' ? -Math.abs(finalMonto) : Math.abs(finalMonto),
                fecha,
                descripcion
            };

            if (tipo === 'gasto' && categoriaId) {
                body.categoria_id = parseInt(categoriaId);
            }

            if ((tipo === 'gasto' || tipo === 'ingreso') && tarjetaId !== '') {
                body.tarjeta_credito_id = parseInt(tarjetaId);
            }

            if (tipo === 'gasto' && presupuestoId !== '') {
                body.presupuesto_id = parseInt(presupuestoId);
            }

            if (initialData) {
                await fetchApi(`/api/transactions/${initialData.id}`, {
                    method: 'PUT',
                    data: body
                });
            } else {
                await fetchApi('/api/transactions', {
                    method: 'POST',
                    data: body
                });
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error guardando movimiento');
        } finally {
            setSubmitting(false);
        }
    };

    const isValido = parseFloat(monto) > 0 && descripcion.trim().length > 0 && fecha;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Movimiento" : "Nuevo Movimiento"}>
            <div className={styles.container}>
                {error && <div className={styles.errorAlert}>{error}</div>}

                {/* Segmented Control */}
                <div className={styles.segmentGroup}>
                    <button
                        className={`${styles.segmentBtn} ${tipo === 'gasto' ? styles.segmentActiveGasto : ''}`}
                        onClick={() => setTipo('gasto')}
                    >
                        Gasto
                    </button>
                    <button
                        className={`${styles.segmentBtn} ${tipo === 'ingreso' ? styles.segmentActiveIngreso : ''}`}
                        onClick={() => setTipo('ingreso')}
                    >
                        Ingreso
                    </button>
                    <button
                        className={`${styles.segmentBtn} ${tipo === 'ahorro' ? styles.segmentActiveAhorro : ''}`}
                        onClick={() => setTipo('ahorro')}
                    >
                        Ahorro
                    </button>
                </div>

                {loadingData ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <Loader2 className={styles.spinner} color="var(--accent-primary)" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Monto</label>
                            <input
                                type="number"
                                step="0.01"
                                className={styles.input}
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Fecha</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                required
                            />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Descripción</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ej. Compra de supermercado"
                                required
                            />
                        </div>

                        {tipo === 'gasto' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Categoría</label>
                                <Select
                                    value={categoriaId}
                                    onChange={setCategoriaId}
                                    options={[
                                        { value: '', label: 'Sin Categoría' },
                                        ...categorias.map(c => ({ value: c.id.toString(), label: c.nombre }))
                                    ]}
                                />
                            </div>
                        )}

                        {tipo === 'gasto' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Presupuesto</label>
                                <Select
                                    value={presupuestoId}
                                    onChange={setPresupuestoId}
                                    options={[
                                        { value: '', label: 'Ninguno' },
                                        ...presupuestos.map(p => ({ value: p.id.toString(), label: p.nombre }))
                                    ]}
                                />
                            </div>
                        )}

                        {tipo === 'gasto' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tarjeta de Crédito</label>
                                <Select
                                    value={tarjetaId}
                                    onChange={setTarjetaId}
                                    options={[
                                        { value: '', label: 'Ninguna' },
                                        ...tarjetas.map(t => ({ value: t.id.toString(), label: t.nombre }))
                                    ]}
                                />
                            </div>
                        )}

                        {tipo === 'ingreso' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tarjeta de Crédito</label>
                                <Select
                                    value={tarjetaId}
                                    onChange={setTarjetaId}
                                    options={[
                                        { value: '', label: 'Ninguna' },
                                        ...tarjetas.map(t => ({ value: t.id.toString(), label: t.nombre }))
                                    ]}
                                />
                            </div>
                        )}

                        {tipo === 'ahorro' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Acción de Ahorro</label>
                                <Select
                                    value={ahorroAction}
                                    onChange={(val) => setAhorroAction(val as 'depositar' | 'retirar')}
                                    options={[
                                        { value: 'depositar', label: 'Depositar' },
                                        { value: 'retirar', label: 'Retirar' }
                                    ]}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`${styles.submitBtn} ${styles.fullWidth}`}
                            disabled={submitting || !isValido}
                        >
                            {submitting ? <Loader2 className={styles.spinner} size={20} /> : <Send size={20} />}
                            Guardar Movimiento
                        </button>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default TransactionModal;
