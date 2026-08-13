import React from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, id }) => {
    return (
        <button
            type="button"
            id={id}
            role="switch"
            aria-checked={checked}
            aria-label={label}
            className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
            onClick={() => onChange(!checked)}
        >
            <span className={styles.thumb} />
        </button>
    );
};

export default Switch;
