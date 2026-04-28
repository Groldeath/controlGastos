import React, { useState } from 'react';
import { Menu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import MonthYearPicker from '../ui/MonthYearPicker';

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

    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Crear un objeto Date usando el mes y año seleccionado para formatear
    // date-fns usa meses 0-indexed (enero es 0)
    const currentDate = setYear(setMonth(new Date(), selectedMonth - 1), selectedYear);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
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
                <div className={styles.dateSelectorContainer}>
                    <div className={styles.dateSelector}>
                        <button
                            className={styles.arrowBtn}
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button 
                            className={styles.dateDisplayBtn}
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                        >
                            {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                        </button>

                        <button
                            className={styles.arrowBtn}
                            onClick={handleNextMonth}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {isPickerOpen && (
                        <>
                            <div className={styles.pickerOverlay} onClick={() => setIsPickerOpen(false)} />
                            <MonthYearPicker 
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                onSelect={(month, year) => {
                                    setSelectedMonth(month);
                                    setSelectedYear(year);
                                    setIsPickerOpen(false);
                                }}
                            />
                        </>
                    )}
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
