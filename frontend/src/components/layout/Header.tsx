import React from 'react';
import { Menu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
    onMenuClick: () => void;
    isMobile: boolean;
    openTransactionModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile, openTransactionModal }) => {
    const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, availableMonths } = useAppContext();
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname === '/' || location.pathname === '/dashboard') return 'Dashboard';
        if (location.pathname === '/movements') return 'Movimientos';
        if (location.pathname === '/users') return 'Gestión de Usuarios';
        return 'Dashboard';
    };

    // Crear un objeto Date usando el mes y año seleccionado para formatear
    // date-fns usa meses 0-indexed (enero es 0)
    const currentDate = setYear(setMonth(new Date(), selectedMonth - 1), selectedYear);

    const currentIndex = availableMonths.findIndex(m => m.month === selectedMonth && m.year === selectedYear);

    // availableMonths está ordenado descendente (más recientes primero).
    // Anteriores (cronológicamente más viejos) están en index + 1
    const hasPrev = currentIndex >= 0 && currentIndex < availableMonths.length - 1;
    // Siguientes (cronológicamente más nuevos) están en index - 1
    const hasNext = currentIndex > 0;

    const handlePrevMonth = () => {
        if (hasPrev) {
            const older = availableMonths[currentIndex + 1];
            setSelectedMonth(older.month);
            setSelectedYear(older.year);
        }
    };

    const handleNextMonth = () => {
        if (hasNext) {
            const newer = availableMonths[currentIndex - 1];
            setSelectedMonth(newer.month);
            setSelectedYear(newer.year);
        }
    };

    const formattedDate = format(currentDate, 'MMMM yyyy', { locale: es });

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button className={styles.menuBtn} onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                {!isMobile && <h2 className={styles.pageTitle} style={{ marginLeft: '12px' }}>{getPageTitle()}</h2>}
            </div>

            <div className={styles.centerSection}>
                <div className={styles.dateSelector}>
                    <button
                        className={styles.arrowBtn}
                        onClick={handlePrevMonth}
                        disabled={!hasPrev}
                        style={{ opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className={styles.dateDisplay}>
                        {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                    </span>

                    <button
                        className={styles.arrowBtn}
                        onClick={handleNextMonth}
                        disabled={!hasNext}
                        style={{ opacity: hasNext ? 1 : 0.4, cursor: hasNext ? 'pointer' : 'not-allowed' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* En desktop mostramos el boton en el header, en mobile usamos el FAB */}
                {!isMobile && (
                    <button className={styles.addBtn} onClick={openTransactionModal}>
                        <Plus size={20} />
                        <span>Agregar Movimiento</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
