// API Base Service Configuration
const API_URL = import.meta.env.VITE_API_URL || '';

interface FetchOptions extends RequestInit {
    data?: any;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
    const token = sessionStorage.getItem('controlGastos_token');

    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.data && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    if (options.data) {
        config.body = JSON.stringify(options.data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorMessage = 'Ocurrió un error inesperado en el servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
            // Not a JSON response
        }

        // Auto-logout si el token expira o es inválido
        if (response.status === 401) {
            sessionStorage.removeItem('controlGastos_token');
            sessionStorage.removeItem('controlGastos_user');
            // Usar replace para evitar acumular entradas en el historial
            window.location.replace('/login');
            // Nunca lanzar error después de redirect — la página se recarga
            return Promise.reject(new Error('Sesión expirada'));
        }

        throw new Error(errorMessage);
    }

    // Comprobar si hay contenido (por ejemplo DELETE a veces no retorna body)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
};
