import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useGameStore } from '../store/gameStore';

/**
 * Distribution « pass-and-play » :
 * pour chaque joueur, dans l'ordre, on affiche un écran de transition (passe
 * l'appareil), puis le joueur tape pour révéler sa carte, puis « J'ai vu ».
 *
 * Important : l'imposteur voit un mot exactement comme un civil — l'écran ne
 * distingue jamais civil/imposteur. Seul l'espion voit « aucun mot ».
 */
export function RevealPage() {
  const navigate = useNavigate();
  const { game, revealIndex, nextReveal } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  if (!game) {
    return <Navigate to="/" replace />;
  }

  // Tous les joueurs ont vu leur carte.
  if (revealIndex >= game.players.length) {
    return <Navigate to="/first-player" replace />;
  }

  const player = game.players[revealIndex]!;
  const isLast = revealIndex === game.players.length - 1;

  function handleSeen() {
    setRevealed(false);
    nextReveal();
    if (isLast) {
      navigate('/first-player');
    }
  }

  if (!revealed) {
    return (
      <Layout>
        <div className="spacer" />
        <div className="center">
          <p className="muted">Passe l'appareil à</p>
          <h1>{player.name}</h1>
        </div>
        <div className="spacer" />
        <button className="btn btn-primary btn-block" onClick={() => setRevealed(true)}>
          Voir ma carte
        </button>
      </Layout>
    );
  }

  return (
    <Layout>
      <p className="muted center">{player.name}</p>
      <div className="reveal-card">
        {player.role === 'spy' ? (
          <>
            <span className="muted">Tu n'as aucun mot</span>
            <span className="reveal-word">🕶️</span>
            <span className="muted">Fais semblant d'en avoir un…</span>
          </>
        ) : (
          <>
            <span className="muted">Ton mot</span>
            <span className="reveal-word">{player.word}</span>
          </>
        )}
      </div>
      <button className="btn btn-primary btn-block" onClick={handleSeen}>
        J'ai vu
      </button>
    </Layout>
  );
}
