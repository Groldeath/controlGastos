import React from 'react';
import Modal from '../ui/Modal';
import Switch from '../ui/Switch';
import { useAppContext } from '../../context/AppContext';
import { CreditCard, Moon, Sun } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme, showGastoAlCorte, setShowGastoAlCorte } = useAppContext();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustes">
            <div className={styles.container}>
                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>
                            <CreditCard size={18} aria-hidden="true" />
                            <span>Gasto al Corte</span>
                        </div>
                        <p className={styles.settingDescription}>
                            Mostrar la sección &quot;Gasto al corte&quot; en la tarjeta &quot;Gastos por tarjeta&quot; del dashboard.
                        </p>
                    </div>
                    <Switch
                        id="switch-gasto-corte"
                        checked={showGastoAlCorte}
                        onChange={setShowGastoAlCorte}
                        label="Mostrar Gasto al Corte"
                    />
                </div>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>
                            {theme === 'dark' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
                            <span>Modo Claro</span>
                        </div>
                        <p className={styles.settingDescription}>
                            Alternar entre modo claro y oscuro de la aplicación.
                        </p>
                    </div>
                    <Switch
                        id="switch-tema"
                        checked={theme === 'light'}
                        onChange={() => toggleTheme()}
                        label="Modo Claro"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
