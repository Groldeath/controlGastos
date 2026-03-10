import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchApi } from '../../services/api';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Movements.module.css';

const Movements: React.FC = () => {
    const { selectedMonth, selectedYear } = useAppContext();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const { openTransactionModal } = useOutletContext<any>();

    const fetchTransactions = async (pageToFetch: number = currentPage) => {
        setLoading(true);
        try {
            const offset = (pageToFetch - 1) * limit;
            const res = await fetchApi(`/api/transactions?month=${selectedMonth}&year=${selectedYear}&limit=${limit}&offset=${offset}`);
            setTransactions(res.data || []);

            // Calcular total de páginas
            const count = res.total || 0;
            setTotalPages(Math.max(1, Math.ceil(count / limit)));
        } catch (err) {
            console.error("Error cargando movimientos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset a la página 1 cuando cambia el mes o el año
        setCurrentPage(1);
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, selectedYear, currentPage]);

    const handleDelete = async (id: number) => {
        try {
            await fetchApi(`/api/transactions/${id}`, { method: 'DELETE' });
            setDeleteConfirmId(null);
            fetchTransactions();
        } catch (err) {
            console.error("Error eliminando movimiento:", err);
            alert("No se pudo eliminar el movimiento");
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Historial de Movimientos</h1>
            </div>

            <div className={styles.tableSection}>
                {loading ? (
                    <div className={styles.loaderContainer}>
                        <Loader2 className={styles.spinner} size={40} />
                    </div>
                ) : transactions.length === 0 ? (
                    <p className={styles.emptyState}>No hay movimientos registrados en este período.</p>
                ) : (
                    <motion.div
                        className={styles.listContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{/* Icono */}</th>
                                        <th>Fecha</th>
                                        <th>Descripción</th>
                                        <th>Categoría</th>
                                        <th>Tarjeta</th>
                                        <th className={styles.amountHeader}>Monto</th>
                                        <th className={styles.actionHeader}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((trx) => (
                                        <tr key={trx.id}>
                                            <td className={styles.iconCell}>
                                                {trx.tipo === 'ingreso' && <ArrowUpRight className={styles.iconInc} size={18} />}
                                                {trx.tipo === 'gasto' && <ArrowDownRight className={styles.iconExp} size={18} />}
                                                {trx.tipo === 'ahorro' && <PiggyBank className={parseFloat(trx.monto) < 0 ? styles.iconExp : styles.iconSav} size={18} />}
                                            </td>
                                            <td className={styles.dateCell}>
                                                {new Date(trx.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className={styles.descCell}>{trx.descripcion}</td>
                                            <td className={styles.catCell}>{trx.categoria?.nombre || 'General'}</td>
                                            <td className={styles.cardCell}>{trx.tipo === 'gasto' ? (trx.tarjeta?.nombre || 'Ninguna') : '-'}</td>
                                            <td className={`${styles.amountCell} ${trx.tipo === 'gasto' ? styles.amountExp :
                                                trx.tipo === 'ingreso' ? styles.amountInc :
                                                    (parseFloat(trx.monto) < 0 ? styles.amountExp : styles.amountSav)
                                                }`}>
                                                {trx.tipo === 'gasto' ? '-' : parseFloat(trx.monto) < 0 ? '-' : '+'}
                                                ${Math.abs(parseFloat(trx.monto)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className={styles.actionCell}>
                                                {deleteConfirmId === trx.id ? (
                                                    <div className={styles.actionButtons}>
                                                        <button
                                                            className={styles.iconBtnSuccess}
                                                            title="Confirmar"
                                                            onClick={() => handleDelete(trx.id)}
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
                                                            onClick={() => openTransactionModal(trx)}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtnDelete}
                                                            title="Eliminar"
                                                            onClick={() => setDeleteConfirmId(trx.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.pagination}>
                            <button
                                className={styles.pageBtn}
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={20} />
                                Anterior
                            </button>

                            <span className={styles.pageInfo}>
                                Página <span className={styles.pageHighlight}>{currentPage}</span> de {totalPages}
                            </span>

                            <button
                                className={styles.pageBtn}
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Movements;
