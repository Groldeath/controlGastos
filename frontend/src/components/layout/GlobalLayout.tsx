import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FAB from './FAB';
import { AnimatePresence } from 'framer-motion';
import CategoryModal from '../modals/CategoryModal';
import CreditCardModal from '../modals/CreditCardModal';
import TransactionModal from '../modals/TransactionModal';
import { useAppContext } from '../../context/AppContext';
import styles from './GlobalLayout.module.css';

export interface LayoutContextType {
    openTransactionModal: (transaction?: any) => void;
}

const GlobalLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any>(null);

    const { triggerRefresh, refreshAvailableMonths } = useAppContext();

    // Manejador del Resize de pantalla para cambiar la presentación On the Fly
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                if (mobile) setSidebarOpen(false); // Cierra al pasar a móvil
                else setSidebarOpen(true); // Abre al pasar a desktop
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial setup handled by state defaults, omitting forced re-render

        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    return (
        <div className={styles.layoutContainer}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
                onOpenCategoryModal={() => setCategoryModalOpen(true)}
                onOpenCardModal={() => setCardModalOpen(true)}
            />

            <main className={styles.mainContent}>
                <Header
                    onMenuClick={() => setSidebarOpen((prev) => !prev)}
                    isMobile={isMobile}
                    openTransactionModal={() => setTransactionModalOpen(true)}
                />

                <div className={styles.pageContent}>
                    {/* React Router renderizará el hijo actual aquí pass context */}
                    <Outlet context={{
                        openTransactionModal: (tx?: any) => {
                            setTransactionToEdit(tx || null);
                            setTransactionModalOpen(true);
                        }
                    } satisfies LayoutContextType} />
                </div>
            </main>

            {/* Solo en móviles montamos el boton de accion flotante */}
            <AnimatePresence>
                {isMobile && (
                    <FAB onClick={() => {
                        setTransactionToEdit(null);
                        setTransactionModalOpen(true);
                    }} />
                )}
            </AnimatePresence>
            {/* Modales Globales */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
            />
            <CreditCardModal
                isOpen={isCardModalOpen}
                onClose={() => setCardModalOpen(false)}
            />
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => {
                    setTransactionModalOpen(false);
                    setTransactionToEdit(null);
                }}
                onSuccess={() => {
                    triggerRefresh();
                    refreshAvailableMonths();
                }}
                initialData={transactionToEdit}
            />
        </div>
    );
};

export default GlobalLayout;
