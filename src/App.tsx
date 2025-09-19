// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Importe suas páginas (agora como .tsx)
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
// Crie as outras páginas (Transactions, Categories, etc.) como componentes vazios por enquanto
// Ex: const TransactionsPage = () => <h1>Transações</h1>;

// O conteúdo visual do Dashboard agora vive em seu próprio componente
import { DashboardPage } from "./pages/Dashboard/DashboardPage";

function AppRoutes() {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas Protegidas */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
      />
      {/* Adicione as outras rotas aqui quando for criá-las */}
      {/* <Route path="/transactions" element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} /> */}

      {/* Redirecionamento Padrão */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

// O componente App agora só contém as rotas
export default function App() {
  return <AppRoutes />;
}
