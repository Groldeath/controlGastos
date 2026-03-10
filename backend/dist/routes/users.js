"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const auth_1 = require("../plugins/auth");
const uc = __importStar(require("../controllers/userController"));
async function default_1(server) {
    // Rutas Públicas
    server.post('/setup', uc.setupInitialAdmin);
    server.post('/login', uc.login);
    server.get('/setup-status', uc.checkSetupStatus);
    // Rutas Protegidas (Requieren Login)
    server.register(async (protectedRoutes) => {
        // Aplicar hook que lanza 401 si no hay un JWT válido
        protectedRoutes.addHook('onRequest', auth_1.verifyJwt);
        protectedRoutes.get('/profile', uc.getProfile);
        // Rutas Exclusivas de Administrador
        protectedRoutes.get('/', { preValidation: [auth_1.requireAdmin] }, uc.getUsers);
        protectedRoutes.post('/', { preValidation: [auth_1.requireAdmin] }, uc.createUser);
        protectedRoutes.put('/:id', { preValidation: [auth_1.requireAdmin] }, uc.updateUser);
        protectedRoutes.delete('/:id', { preValidation: [auth_1.requireAdmin] }, uc.deleteUser);
    });
}
