import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    ListOrdered,
    Tags,
    CreditCard,
    Users,
    LogOut,
    User,
    Wallet, // Added Wallet icon
    PieChart, // Added PieChart for budgets
    PiggyBank // Added for Alcancías
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
    onOpenCategoryModal: () => void;
    onOpenCardModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile, onOpenCategoryModal, onOpenCardModal }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/alcancias', icon: <PiggyBank size={20} />, label: 'Alcancías' },
        { path: '/budgets', icon: <PieChart size={20} />, label: 'Presupuestos' },
        { path: '/movements', icon: <ListOrdered size={20} />, label: 'Movimientos' },
    ];

    /*
      Nota: Categorías y Tarjetas idealmente abrirán modales,
      por lo que en lugar de un NavLink podrian ser simples botones.
      Para este esqueleto, los pondremos como botones que luego dispararán estados.
    */

    const handleLinkClick = () => {
        if (isMobile) onClose();
    };

    const sidebarContent = (
        <div className={styles.sidebarContent}>
            <div className={styles.header}>
                <div className={styles.logoTitleContainer}>
                    <Wallet size={24} className={styles.logoIcon} />
                    <div className={styles.logo}>Control de Gastos</div>
                </div>
            </div>

            <div className={styles.navSection}>
                <p className={styles.sectionTitle}>Principal</p>
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrapper}>{item.icon}</div>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className={styles.navSection}>
                <p className={styles.sectionTitle}>Administración</p>
                <nav className={styles.nav}>
                    <button className={styles.navButton} onClick={onOpenCategoryModal}>
                        <div className={styles.iconWrapper}><Tags size={20} /></div>
                        <span>Categorías</span>
                    </button>
                    <button className={styles.navButton} onClick={onOpenCardModal}>
                        <div className={styles.iconWrapper}><CreditCard size={20} /></div>
                        <span>Tarjetas</span>
                    </button>
                    {user?.rol === 'admin' && (
                        <NavLink
                            to="/users"
                            onClick={handleLinkClick}
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrapper}><Users size={20} /></div>
                            <span>Usuarios</span>
                        </NavLink>
                    )}
                </nav>
            </div>

            <div className={styles.footer}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <User size={20} />
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>{user?.nombre_usuario}</span>
                        <span className={styles.userRole}>{user?.rol}</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} onClick={logout} title="Cerrar sesión">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.overlay}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Enclosure */}
            <AnimatePresence>
                {(!isMobile || isOpen) && (
                    <motion.aside
                        className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ''}`}
                        initial={isMobile ? { x: '-100%' } : { x: 0, width: 280 }}
                        animate={isMobile ? { x: 0 } : { x: 0, width: isOpen ? 280 : 0 }}
                        exit={isMobile ? { x: '-100%' } : {}}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
