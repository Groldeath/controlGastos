import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
// Layout Global
import GlobalLayout from './components/layout/GlobalLayout'
import { AppProvider } from './context/AppContext'

import Login from './pages/Login/Login';
import OidcCallback from './pages/Login/OidcCallback';
import Dashboard from './pages/Dashboard/Dashboard';

import Movements from './pages/Movements/Movements';
import Users from './pages/Users/Users';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OidcCallback />} />

            {/* Rutas Privadas (Proximamente protegidas) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Shell Application Layout Wrapper */}
            <Route element={<GlobalLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/users" element={<Users />} />
            </Route>

            {/* Ruta comodín */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
