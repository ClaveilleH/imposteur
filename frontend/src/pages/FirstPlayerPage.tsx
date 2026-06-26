import { Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useGameStore } from '../store/gameStore';

/** Annonce le joueur qui commence le débat. */
export function FirstPlayerPage() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);

  if (!game) {
    return <Navigate to="/" replace />;
  }

  const first = game.players.find((p) => p.order === game.firstPlayerOrder);

  return (
    <Layout>
      <div className="spacer" />
      <div className="center">
        <p className="muted">C'est à</p>
        <h1>{first?.name}</h1>
        <p className="muted">de commencer le débat.</p>
      </div>
      <div className="spacer" />
      <button className="btn btn-primary btn-block" onClick={() => navigate('/vote')}>
        Passer au vote
      </button>
    </Layout>
  );
}
