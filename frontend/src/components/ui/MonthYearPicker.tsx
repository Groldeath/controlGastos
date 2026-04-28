import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './MonthYearPicker.module.css';

interface MonthYearPickerProps {
    selectedMonth: number; // 1-12
    selectedYear: number;
    onSelect: (month: number, year: number) => void;
}

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DEC'];

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ selectedMonth, selectedYear, onSelect }) => {
    const [viewYear, setViewYear] = useState(selectedYear);

    // Si el año seleccionado cambia externamente, actualizamos la vista
    useEffect(() => {
        setViewYear(selectedYear);
    }, [selectedYear]);

    const handlePrevYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewYear(prev => prev - 1);
    };

    const handleNextYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewYear(prev => prev + 1);
    };

    const handleMonthClick = (monthIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(monthIndex + 1, viewYear);
    };

    return (
        <div className={styles.pickerContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
                <button className={styles.iconBtn} onClick={handlePrevYear} type="button">
                    <ChevronLeft size={18} />
                </button>
                <span className={styles.yearText}>{viewYear}</span>
                <button className={styles.iconBtn} onClick={handleNextYear} type="button">
                    <ChevronRight size={18} />
                </button>
            </div>
            <div className={styles.monthsGrid}>
                {MONTHS.map((month, index) => {
                    const isSelected = selectedMonth === index + 1 && selectedYear === viewYear;
                    return (
                        <button
                            key={month}
                            type="button"
                            className={`${styles.monthBtn} ${isSelected ? styles.selected : ''}`}
                            onClick={(e) => handleMonthClick(index, e)}
                        >
                            {month}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthYearPicker;
