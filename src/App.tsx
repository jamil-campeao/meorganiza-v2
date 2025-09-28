import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { CategoriesPage } from "./pages/Categories/CategoriesPage";
import { AccountsPage } from "./pages/Accounts/AccountsPage";
import { CardsPage } from "./pages/Cards/CardsPage";
import { TransactionsPage } from "./pages/Transactions/TransactionsPage";
import { InvestmentsPage } from "./pages/Investments/InvestmentsPage";
import { BillsPage } from "./pages/Bills/BillsPage";
import { InvoicesPage } from "./pages/Invoices/InvoicesPage";
import { ReportsPage } from "./pages/Reports/ReportsPage";

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
      <Route
        path="/cards"
        element={isAuthenticated ? <CardsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/transactions"
        element={
          isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/investments"
        element={
          isAuthenticated ? <InvestmentsPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/bills"
        element={isAuthenticated ? <BillsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/invoices"
        element={isAuthenticated ? <InvoicesPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/reports"
        element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />}
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
