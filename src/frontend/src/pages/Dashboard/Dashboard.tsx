import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchApi } from '../../services/api';
import SummaryCard from '../../components/ui/SummaryCard';
import BreakdownCard from '../../components/ui/BreakdownCard';
import { ArrowRight, Loader2, Tags, CreditCard, ArrowDownRight, ArrowUpRight, PiggyBank, Edit2, Trash2, Check, X, PieChart } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { BudgetService, type Budget } from '../../services/budgetService';
import styles from './Dashboard.module.css';
import { motion } from 'framer-motion';

interface SummaryData {
    ingresos: number;
    gastos: number;
    balance: number;
    balanceNetoReal: number;
    ahorroTotal: number;
    gastosPorCategoria: { nombre: string; total: number }[];
    gastosPorTarjeta: { nombre: string; total: number; dia_corte?: number; dia_pago?: number }[];
    gastosPorTarjetaMes: { nombre: string; total: number; dia_corte?: number; dia_pago?: number }[];
}

const Dashboard: React.FC = () => {
    const { selectedMonth, selectedYear, refreshTrigger } = useAppContext();
    const [summary, setSummary] = useState<SummaryData>({
        ingresos: 0, gastos: 0, balance: 0, balanceNetoReal: 0, ahorroTotal: 0,
        gastosPorCategoria: [], gastosPorTarjeta: [], gastosPorTarjetaMes: []
    });

    const [loading, setLoading] = useState(true);
    // Para las transacciones recientes podríamos reutilizar el mismo endpoint de lista, pero pidiendo limit = 5
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const ctx = useOutletContext<any>();
    const openTransactionModal = ctx?.openTransactionModal || (() => {});

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch summary
            const sumRes = await fetchApi(`/api/transactions/summary?month=${selectedMonth}&year=${selectedYear}`);
            setSummary(sumRes);

            // Fetch recent transactions (first page, limit 5)
            const trxRes = await fetchApi(`/api/transactions?month=${selectedMonth}&year=${selectedYear}&limit=5`);
            setRecentTransactions(trxRes.data || []);

            // Fetch budgets
            const budgetsRes = await BudgetService.getAll(selectedMonth, selectedYear);
            setBudgets(budgetsRes);
        } catch (err) {
            console.error("Error cargando dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedMonth, selectedYear, refreshTrigger]);

    const handleDelete = async (id: number) => {
        try {
            await fetchApi(`/api/transactions/${id}`, { method: 'DELETE' });
            setDeleteConfirmId(null);
            fetchDashboardData();
        } catch (err) {
            console.error("Error eliminando movimiento:", err);
            alert("No se pudo eliminar el movimiento");
        }
    };

    return (
        <div className={styles.container}>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <Loader2 className={styles.spinner} size={40} />
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        <motion.div
                            className={styles.balanceCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                            whileHover={{ y: -4 }}
                        >
                            <div className={styles.balanceCardHeader}>
                                <span className={styles.balanceCardTitle}>Balance</span>
                                <div className={styles.balanceCardIcon}>
                                    <PieChart size={24} />
                                </div>
                            </div>
                            <div className={styles.balanceRow}>
                                <div className={styles.balanceItem}>
                                    <span className={styles.balanceLabel}>Neto</span>
                                    <span className={`${styles.balanceAmount} ${summary.balanceNetoReal < 0 ? styles.balanceNegative : ''}`}>
                                        ${Math.abs(summary.balanceNetoReal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.balanceDivider} />
                                <div className={styles.balanceItem}>
                                    <span className={styles.balanceLabel}>Restante</span>
                                    <span className={`${styles.balanceAmount} ${summary.balance < 0 ? styles.balanceNegative : ''}`}>
                                        ${Math.abs(summary.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        <SummaryCard title="Ingresos Totales" amount={summary.ingresos} type="income" delay={2} />
                        <SummaryCard title="Gastos Totales" amount={summary.gastos} type="expense" delay={3} />
                        <SummaryCard title="Ahorro Total" amount={summary.ahorroTotal} type="savings" delay={4} />
                    </div>

                    {budgets.length > 0 && (
                        <div className={styles.budgetsSection}>
                            <div className={styles.recentHeader}>
                                <h2 className={styles.sectionTitle}>Presupuestos</h2>
                                <Link to="/budgets" className={styles.viewAllBtn}>
                                    Ver Todos
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                            <div className={styles.budgetGrid}>
                                {budgets.map((b) => {
                                    const totalGastado = b.total_gastado || 0;
                                    const limit = parseFloat(b.monto_limite as any);
                                    const percentage = limit > 0 ? Math.min((totalGastado / limit) * 100, 100) : 0;
                                    const progressColor = percentage >= 90 ? '#ef4444' : percentage >= 75 ? '#f59e0b' : '#10b981';
                                    return (
                                        <div key={b.id} className={styles.budgetCard}>
                                            <div className={styles.budgetCardHeader}>
                                            <div className={styles.budgetCardName}>
                                                {b.nombre}
                                            </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    ${limit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className={styles.budgetCardAmounts}>
                                                <span>Gastado: <span className={styles.budgetCardSpent}>
                                                    ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </span></span>
                                                <span>Restante: ${Math.max(0, limit - totalGastado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className={styles.budgetProgressTrack}>
                                                <div
                                                    className={styles.budgetProgressBar}
                                                    style={{ width: `${percentage}%`, backgroundColor: progressColor }}
                                                />
                                            </div>
                                            <div className={styles.budgetProgressFooter}>
                                                <span className={styles.budgetPercentage} style={{ color: progressColor }}>
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles.breakdownGrid}>
                        <BreakdownCard
                            title="Gastos por Categoría"
                            data={summary.gastosPorCategoria}
                            icon={<Tags size={20} />}
                            delay={1}
                        />
                        <BreakdownCard
                            title="Gastos por tarjeta"
                            data={summary.gastosPorTarjeta}
                            mesData={summary.gastosPorTarjetaMes}
                            icon={<CreditCard size={20} />}
                            delay={2}
                            isCardData={true}
                        />
                    </div>

                    <div className={styles.recentSection}>
                        <div className={styles.recentHeader}>
                            <h2 className={styles.sectionTitle}>Últimos Movimientos</h2>
                            <Link to="/movements" className={styles.viewAllBtn}>
                                Ver Todos
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className={styles.recentList}>
                            {recentTransactions.length === 0 ? (
                                <p className={styles.emptyState}>No hay movimientos registrados en este mes.</p>
                            ) : (
                                <motion.div
                                    className={styles.listContainer}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className={styles.tableContainer}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>{/* Icono */}</th>
                                                    <th>Fecha</th>
                                                    <th>Descripción</th>
                                                    <th>Categoría</th>
                                                    <th>Presupuesto</th>
                                                    <th>Tarjeta</th>
                                                    <th className={styles.amountHeader}>Monto</th>
                                                    <th className={styles.actionHeader}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTransactions.map((trx) => (
                                                    <tr key={trx.id}>
                                                        <td className={styles.iconCell}>
                                                            {trx.tipo === 'ingreso' && <ArrowUpRight className={styles.iconInc} size={18} />}
                                                            {trx.tipo === 'gasto' && <ArrowDownRight className={styles.iconExp} size={18} />}
                                                            {trx.tipo === 'ahorro' && (
                                                                <PiggyBank
                                                                    className={parseFloat(trx.monto) < 0 ? styles.iconExp : styles.iconSav}
                                                                    size={18}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className={styles.dateCell}>
                                                            {new Date(trx.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className={styles.descCell}>{trx.descripcion}</td>
                                                        <td className={styles.catCell}>{trx.categoria?.nombre || 'General'}</td>
                                                        <td className={styles.catCell}>{trx.tipo === 'gasto' ? (trx.presupuesto?.nombre || '-') : '-'}</td>
                                                        <td className={styles.cardCell}>{(trx.tipo === 'gasto' || trx.tipo === 'ingreso') ? (trx.tarjeta?.nombre || '-') : '-'}</td>
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
                                </motion.div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
