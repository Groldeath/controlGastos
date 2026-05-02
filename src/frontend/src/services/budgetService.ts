import { fetchApi } from './api';

export interface Budget {
    id: number;
    usuario_id: number;
    nombre: string;
    monto_limite: number | string;
    mes: number;
    anio: number;
    color_hex: string;
    fecha_creacion: string;
    total_gastado?: number;
}

export const BudgetService = {
    getAll: (mes?: number, anio?: number) => {
        let query = '';
        if (mes && anio) {
            query = `?mes=${mes}&anio=${anio}`;
        }
        return fetchApi(`/api/presupuestos${query}`);
    },

    create: (data: { nombre: string; monto_limite: number; mes: number; anio: number; color_hex?: string }) => {
        return fetchApi('/api/presupuestos', {
            method: 'POST',
            data,
        });
    },

    update: (id: number, data: { nombre?: string; monto_limite?: number; color_hex?: string }) => {
        return fetchApi(`/api/presupuestos/${id}`, {
            method: 'PUT',
            data,
        });
    },

    delete: (id: number) => {
        return fetchApi(`/api/presupuestos/${id}`, {
            method: 'DELETE',
        });
    },

    getTransactions: (id: number) => {
        return fetchApi(`/api/presupuestos/${id}/movimientos`);
    }
};
