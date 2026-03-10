import { useState, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchApi } from '../services/api';

interface MonthYear {
    month: number;
    year: number;
}

interface AppContextType {
    selectedMonth: number; // 1-12
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
    availableMonths: MonthYear[];
    refreshAvailableMonths: () => Promise<void>;
    refreshTrigger: number;
    triggerRefresh: () => void;
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

    const { isAuthenticated } = useAuth();

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

    return (
        <AppContext.Provider value={{
            selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
            availableMonths, refreshAvailableMonths,
            refreshTrigger, triggerRefresh
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
