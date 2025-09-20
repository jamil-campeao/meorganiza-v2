import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { CategoriesPage } from "./pages/Categories/CategoriesPage";
import { AccountsPage } from "./pages/Accounts/AccountsPage";

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
      <Route
        path="/categories"
        element={
          isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/accounts"
        element={isAuthenticated ? <AccountsPage /> : <Navigate to="/login" />}
      />

      {/* Redirecionamento Padrão */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
