import { useState, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchApi } from '../services/api';

interface MonthYear {
    month: number;
    year: number;
}

type Theme = 'dark' | 'light';

interface AppContextType {
    selectedMonth: number; // 1-12
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
    availableMonths: MonthYear[];
    refreshAvailableMonths: () => Promise<void>;
    refreshTrigger: number;
    triggerRefresh: () => void;
    theme: Theme;
    toggleTheme: () => void;
    showGastoAlCorte: boolean;
    setShowGastoAlCorte: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [availableMonths, setAvailableMonths] = useState<MonthYear[]>([{ month: currentMonth, year: currentYear }]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    // Preferencias: se inicializan desde localStorage (cache local) para evitar parpadeos
    // y se sincronizan contra el servidor (fuente de verdad entre dispositivos).
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('controlGastos_theme');
        return stored === 'light' ? 'light' : 'dark';
    });
    const [showGastoAlCorte, setShowGastoAlCorteState] = useState<boolean>(() => {
        const stored = localStorage.getItem('controlGastos_showCorte');
        return stored !== 'false';
    });

    const { isAuthenticated } = useAuth();

    const persistSettings = (nextTheme: Theme, nextShowCorte: boolean) => {
        if (!isAuthenticated) return;
        fetchApi('/api/settings', {
            method: 'PUT',
            data: { tema: nextTheme, mostrar_gasto_corte: nextShowCorte }
        }).catch(() => {});
    };

    const toggleTheme = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('controlGastos_theme', next);
        persistSettings(next, showGastoAlCorte);
    };

    const setShowGastoAlCorte = (value: boolean) => {
        setShowGastoAlCorteState(value);
        localStorage.setItem('controlGastos_showCorte', String(value));
        persistSettings(theme, value);
    };

    const refreshAvailableMonths = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await fetchApi('/api/transactions/active-months');
            const months: MonthYear[] = res || [];

            // Add current month if not present
            const hasCurrent = months.some(m => m.month === currentMonth && m.year === currentYear);
            if (!hasCurrent) {
                months.push({ month: currentMonth, year: currentYear });
            }

            // Sort descending: newest first
            months.sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });

            setAvailableMonths(months);
        } catch (error) {
            console.error('Error fetching available months', error);
        }
    };

    useEffect(() => {
        refreshAvailableMonths();
    }, [isAuthenticated]);

    // Cargar preferencias del servidor al autenticarse
    useEffect(() => {
        if (!isAuthenticated) return;
        fetchApi('/api/settings')
            .then((res) => {
                if (res && (res.tema === 'dark' || res.tema === 'light')) {
                    setTheme(res.tema);
                    localStorage.setItem('controlGastos_theme', res.tema);
                }
                if (res && typeof res.mostrar_gasto_corte === 'boolean') {
                    setShowGastoAlCorteState(res.mostrar_gasto_corte);
                    localStorage.setItem('controlGastos_showCorte', String(res.mostrar_gasto_corte));
                }
            })
            .catch(() => {});
    }, [isAuthenticated]);

    // Aplicar la clase de tema al body
    useEffect(() => {
        document.body.classList.toggle('light-mode', theme === 'light');
    }, [theme]);

    return (
        <AppContext.Provider value={{
            selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
            availableMonths, refreshAvailableMonths,
            refreshTrigger, triggerRefresh,
            theme, toggleTheme, showGastoAlCorte, setShowGastoAlCorte
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
