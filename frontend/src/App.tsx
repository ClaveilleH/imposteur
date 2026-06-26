import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreateGamePage } from './pages/CreateGamePage';
import { RevealPage } from './pages/RevealPage';
import { FirstPlayerPage } from './pages/FirstPlayerPage';
import { VotePage } from './pages/VotePage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ThemesAdminPage } from './pages/admin/ThemesAdminPage';
import { WordPairsAdminPage } from './pages/admin/WordPairsAdminPage';
import { RequireAdmin } from './components/RequireAdmin';

export function App() {
  return (
    <Routes>
      {/* Parcours de jeu */}
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateGamePage />} />
      <Route path="/reveal" element={<RevealPage />} />
      <Route path="/first-player" element={<FirstPlayerPage />} />
      <Route path="/vote" element={<VotePage />} />

      {/* Administration */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/themes"
        element={
          <RequireAdmin>
            <ThemesAdminPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/word-pairs"
        element={
          <RequireAdmin>
            <WordPairsAdminPage />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
