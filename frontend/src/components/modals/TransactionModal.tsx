import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { Loader2, Send } from 'lucide-react';
import styles from './TransactionModal.module.css';

interface Category {
    id: number;
    nombre: string;
}

interface CreditCard {
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

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [descripcion, setDescripcion] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [tarjetaId, setTarjetaId] = useState('');
    const [ahorroAction, setAhorroAction] = useState<'depositar' | 'retirar'>('depositar');

    const [categorias, setCategorias] = useState<Category[]>([]);
    const [tarjetas, setTarjetas] = useState<CreditCard[]>([]);
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
                setAhorroAction(parseFloat(initialData.monto) < 0 ? 'retirar' : 'depositar');
            } else {
                // Reset form
                setTipo('gasto');
                setMonto('');
                setFecha(new Date().toISOString().split('T')[0]);
                setDescripcion('');
                setCategoriaId('');
                setTarjetaId('');
                setAhorroAction('depositar');
            }
            setError('');
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const [catsRes, cardsRes] = await Promise.all([
                fetchApi('/api/categories'),
                fetchApi('/api/credit-cards')
            ]);
            setCategorias(catsRes);
            setTarjetas(cardsRes);

            setCategorias(catsRes);
            setTarjetas(cardsRes);

            // Set first item as default if available ONLY if we are NOT editing
            if (!initialData) {
                if (catsRes.length > 0) setCategoriaId(catsRes[0].id.toString());
                // Para tarjetas, el valor vacio '' representará "Ninguna"
                setTarjetaId('');
            }
        } catch (err: any) {
            setError('Error cargando datos: ' + err.message);
        } finally {
            setLoadingData(false);
        }
    };

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

            if (tipo === 'gasto' && tarjetaId !== '') {
                body.tarjeta_credito_id = parseInt(tarjetaId);
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
                                <select
                                    className={styles.select}
                                    value={categoriaId}
                                    onChange={(e) => setCategoriaId(e.target.value)}
                                >
                                    <option value="">Sin Categoría</option>
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tipo === 'gasto' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tarjeta de Crédito</label>
                                <select
                                    className={styles.select}
                                    value={tarjetaId}
                                    onChange={(e) => setTarjetaId(e.target.value)}
                                >
                                    <option value="">Ninguna</option>
                                    {tarjetas.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tipo === 'ahorro' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Acción de Ahorro</label>
                                <select
                                    className={styles.select}
                                    value={ahorroAction}
                                    onChange={(e) => setAhorroAction(e.target.value as 'depositar' | 'retirar')}
                                >
                                    <option value="depositar">Depositar</option>
                                    <option value="retirar">Retirar</option>
                                </select>
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
