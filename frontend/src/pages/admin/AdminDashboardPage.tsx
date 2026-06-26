import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAdminStore } from '../../store/adminStore';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const logout = useAdminStore((s) => s.logout);

  return (
    <Layout>
      <h1>Tableau de bord</h1>
      <Link to="/admin/themes" className="btn btn-block">
        Gestion des thèmes
      </Link>
      <Link to="/admin/word-pairs" className="btn btn-block">
        Gestion des paires de mots
      </Link>
      <div className="spacer" />
      <button
        className="btn btn-block"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        Se déconnecter
      </button>
    </Layout>
  );
}
