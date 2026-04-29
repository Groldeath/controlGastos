import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './FAB.module.css';

interface FABProps {
    onClick: () => void;
}

const FAB: React.FC<FABProps> = ({ onClick }) => {
    return (
        <motion.button
            className={styles.fab}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Plus size={28} />
        </motion.button>
    );
};

export default FAB;
