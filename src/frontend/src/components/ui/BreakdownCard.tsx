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
    mesData?: BreakdownItem[];
}

const BreakdownCard: React.FC<BreakdownCardProps> = ({ title, data, icon, delay = 0, isCardData = false, mesData }) => {
    const { selectedMonth } = useAppContext();

    const totalSum = data.length > 0 ? data.reduce((acc, curr) => acc + curr.total, 0) : 1;

    const totalTarjetas = isCardData ? Math.max(mesData?.length || 0, data.length) : 0;
    const necesitaScroll = totalTarjetas > 2;

    const formatearFechas = (diaCorte: number, diaPago: number): string => {
        const currentMonthIdx = selectedMonth - 1;
        const nextMonthIdx = (currentMonthIdx + 1) % 12;
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesCorteStr = meses[currentMonthIdx];
        const mesPagoIdx = (diaPago > diaCorte) ? currentMonthIdx : nextMonthIdx;
        const mesPagoStr = meses[mesPagoIdx];
        return `(${String(diaCorte).padStart(2, '0')}/${mesCorteStr} | ${String(diaPago).padStart(2, '0')}/${mesPagoStr})`;
    };

    const renderTarjetaItem = (item: BreakdownItem, mostrarFechas: boolean, key: string) => (
        <li key={key} className={styles.listItem}>
            <div className={styles.labelGroup}>
                <div className={styles.nameBlock}>
                    <span className={styles.name}>{item.nombre}</span>
                    {mostrarFechas && item.dia_corte && item.dia_pago && (
                        <span className={styles.cardDates}>{formatearFechas(item.dia_corte, item.dia_pago)}</span>
                    )}
                </div>
                <span className={styles.amount}>
                    ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
            </div>
        </li>
    );

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

            <div className={`${styles.content} ${necesitaScroll ? styles.contentScroll : ''}`}>
                {isCardData && mesData && mesData.length > 0 ? (
                    <>
                        <ul className={styles.list} style={necesitaScroll ? { maxHeight: 'none', overflow: 'visible' } : undefined}>
                            {mesData.map((item, i) => renderTarjetaItem(item, false, `mes-${i}`))}
                        </ul>
                        <div className={styles.sectionTitle}>Gasto al corte</div>
                        {data.length === 0 ? (
                            <p className={styles.empty}>No hay datos de corte registrados.</p>
                        ) : (
                            <ul className={styles.list} style={necesitaScroll ? { maxHeight: 'none', overflow: 'visible' } : undefined}>
                                {data.map((item, i) => renderTarjetaItem(item, true, `corte-${i}`))}
                            </ul>
                        )}
                    </>
                ) : data.length === 0 ? (
                    <p className={styles.empty}>No hay datos registrados este mes.</p>
                ) : (
                    <ul className={styles.list}>
                        {data.map((item, index) => {
                            const percentage = Math.round((item.total / totalSum) * 100);

                            let displayDates = null;
                            if (isCardData && item.dia_corte && item.dia_pago) {
                                displayDates = formatearFechas(item.dia_corte, item.dia_pago);
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
