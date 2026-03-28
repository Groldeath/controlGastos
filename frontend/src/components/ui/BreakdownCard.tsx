import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import styles from './BreakdownCard.module.css';

interface BreakdownItem {
    nombre: string;
    total: number;
    dia_corte?: number;
    dia_pago?: number;
}

interface BreakdownCardProps {
    title: string;
    data: BreakdownItem[];
    icon?: React.ReactNode;
    delay?: number;
    isCardData?: boolean;
}

const BreakdownCard: React.FC<BreakdownCardProps> = ({ title, data, icon, delay = 0, isCardData = false }) => {
    const { selectedMonth } = useAppContext();
    
    // Para categorías, queremos que la barra represente el porcentaje respecto a TODOS los gastos de la lista
    const totalSum = data.length > 0 ? data.reduce((acc, curr) => acc + curr.total, 0) : 1;

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
        >
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    {icon && <div className={styles.iconWrapper}>{icon}</div>}
                    <span className={styles.title}>{title}</span>
                </div>
            </div>

            <div className={styles.content}>
                {data.length === 0 ? (
                    <p className={styles.empty}>No hay datos registrados este mes.</p>
                ) : (
                    <ul className={styles.list}>
                        {data.map((item, index) => {
                            const percentage = Math.round((item.total / totalSum) * 100);

                            // Formatear fechas para tarjetas (si existen)
                            let displayDates = null;
                            if (isCardData && item.dia_corte && item.dia_pago) {
                                // selectedMonth is 1-12
                                const currentMonthIdx = selectedMonth - 1; // 0-11
                                const nextMonthIdx = (currentMonthIdx + 1) % 12;

                                const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                                
                                const mesCorteStr = meses[currentMonthIdx];
                                // Si el día de pago es mayor al de corte, cae en el mismo mes.
                                // Si es menor, cae en el siguiente mes.
                                const mesPagoIdx = (item.dia_pago > item.dia_corte) ? currentMonthIdx : nextMonthIdx;
                                const mesPagoStr = meses[mesPagoIdx];

                                displayDates = `(${String(item.dia_corte).padStart(2, '0')}/${mesCorteStr} | ${String(item.dia_pago).padStart(2, '0')}/${mesPagoStr})`;
                            }

                            return (
                                <li key={index} className={styles.listItem}>
                                    <div className={styles.labelGroup}>
                                        <div className={styles.nameBlock}>
                                            <span className={styles.name}>{item.nombre}</span>
                                            {displayDates && <span className={styles.cardDates}>{displayDates}</span>}
                                        </div>
                                        <span className={styles.amount}>
                                            ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {!isCardData && (
                                        <div className={styles.barBackground}>
                                            <motion.div
                                                className={styles.barFill}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: (delay * 0.1) + 0.3, ease: 'easeOut' }}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </motion.div>
    );
};

export default BreakdownCard;
