"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar .env de la raíz en desarrollo local
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const server = (0, fastify_1.default)({
    logger: true
});
server.register(cors_1.default, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});
server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret'
});
// Registrar rutas
const users_1 = __importDefault(require("./routes/users"));
const categories_1 = __importDefault(require("./routes/categories"));
const creditCards_1 = __importDefault(require("./routes/creditCards"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const auth_1 = __importDefault(require("./routes/auth"));
server.register(users_1.default, { prefix: '/api/users' });
server.register(categories_1.default, { prefix: '/api/categories' });
server.register(creditCards_1.default, { prefix: '/api/credit-cards' });
server.register(transactions_1.default, { prefix: '/api/transactions' });
server.register(auth_1.default, { prefix: '/api/auth' });
server.get('/ping', async (request, reply) => {
    return { status: 'ok', time: new Date() };
});
const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        server.log.info(`Server listening on ${server.server.address()}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
