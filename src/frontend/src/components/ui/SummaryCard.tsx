import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, PiggyBank, Wallet } from 'lucide-react';
import styles from './SummaryCard.module.css';

interface SummaryCardProps {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'balance' | 'savings' | 'neto';
    delay?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, delay = 0 }) => {

    const getIcon = () => {
        switch (type) {
            case 'income': return <TrendingUp size={24} className={styles.iconIncome} />;
            case 'expense': return <TrendingDown size={24} className={styles.iconExpense} />;
            case 'balance': return <Wallet size={24} className={styles.iconBalance} />;
            case 'neto': return <PieChart size={24} className={styles.iconBalance} />;
            case 'savings': return <PiggyBank size={24} className={styles.iconSavings} />;
        }
    };

    const formattedAmount = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
        >
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <div className={`${styles.iconWrapper} ${styles[type]}`}>
                    {getIcon()}
                </div>
            </div>

            <div className={styles.amountContainer}>
                <span className={`${styles.amount} ${(type === 'balance' || type === 'neto' || type === 'savings') && amount < 0 ? styles.negativeBalance : ''}`}>
                    {formattedAmount}
                </span>
            </div>
        </motion.div>
    );
};

export default SummaryCard;
