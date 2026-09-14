import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader">Loading DevFlow…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader">Loading DevFlow…</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <AuthPage mode="login" />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <AuthPage mode="register" />
          </GuestOnly>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
