import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layout/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OrganizerPage from "./pages/OrganizerPage.jsx";
import ClientPage from "./pages/ClientPage.jsx";
import GatePage from "./pages/GatePage.jsx";
import ShareLookupPage from "./pages/ShareLookupPage.jsx";

const ROLE_HOME = { organizer: "/organizer", client: "/client", gate: "/gate" };

function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}

function IndexRedirect() {
  const { user, restoring } = useAuth();
  if (restoring) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/share"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<IndexRedirect />} />
        <Route
          path="/organizer"
          element={
            <RoleRoute role="organizer">
              <OrganizerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/client"
          element={
            <RoleRoute role="client">
              <ClientPage />
            </RoleRoute>
          }
        />
        <Route
          path="/gate"
          element={
            <RoleRoute role="gate">
              <GatePage />
            </RoleRoute>
          }
        />
        <Route path="/share" element={<ShareLookupPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
