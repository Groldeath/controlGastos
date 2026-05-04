import React, { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Atrapar foco dentro del modal al abrir
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
                focusable[0].focus();
            }
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <div className={styles.modalWrapper}>
                        <motion.div
                            ref={modalRef}
                            className={styles.modal}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={titleId}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className={styles.header}>
                                <h2 className={styles.title} id={titleId}>{title}</h2>
                                <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>
                            <div className={styles.content}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
