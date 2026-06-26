import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <div className="spacer" />
      <div className="center">
        <h1>🕵️ Imposteur</h1>
        <p className="muted">Un seul appareil, passé entre les joueurs.</p>
      </div>

      <Link to="/create" className="btn btn-primary btn-block">
        Nouvelle partie
      </Link>
      <Link to="/admin/login" className="btn btn-block">
        Administration
      </Link>
      <div className="spacer" />
      <p className="muted center">Trouvez l'imposteur… ou survivez.</p>
    </Layout>
  );
}
