import { fetchApi } from './api';

export interface Alcancia {
    id: number;
    usuario_id: number;
    nombre: string;
    tipo: 'ahorro' | 'fondo';
    saldo_actual: number;
    saldo_objetivo: number | null;
    monto_inicial: number | null;
    color_hex: string;
    fecha_creacion: string;
}

export const AlcanciaService = {
    getAll: () => fetchApi('/api/alcancias'),

    create: (data: { nombre: string; tipo: 'ahorro' | 'fondo'; saldo_objetivo?: number; monto_inicial?: number; color_hex?: string }) =>
        fetchApi('/api/alcancias', { method: 'POST', data }),

    update: (id: number, data: { nombre?: string; saldo_objetivo?: number | null; monto_inicial?: number; color_hex?: string }) =>
        fetchApi(`/api/alcancias/${id}`, { method: 'PUT', data }),

    delete: (id: number) =>
        fetchApi(`/api/alcancias/${id}`, { method: 'DELETE' }),

    depositar: (id: number, monto: number) =>
        fetchApi(`/api/alcancias/${id}/depositar`, { method: 'PATCH', data: { monto } }),

    retirar: (id: number, monto: number) =>
        fetchApi(`/api/alcancias/${id}/retirar`, { method: 'PATCH', data: { monto } }),
};
