import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useGameStore } from '../store/gameStore';
import type { Role } from '../types';

const ROLE_LABEL: Record<Role, string> = {
  civilian: 'Civil',
  impostor: 'Imposteur 🕵️',
  spy: 'Espion 🕶️',
};

/**
 * Après débat : on vote pour éliminer un joueur. On clique sur la personne,
 * on confirme, puis son rôle est révélé. On peut continuer à éliminer ou
 * terminer la partie.
 */
export function VotePage() {
  const navigate = useNavigate();
  const { game, eliminated, eliminate, reset } = useGameStore();
  const [pending, setPending] = useState<number | null>(null);

  if (!game) {
    return <Navigate to="/" replace />;
  }

  const remaining = game.players.filter((p) => !eliminated.includes(p.order));
  const pendingPlayer = pending !== null ? game.players.find((p) => p.order === pending) : undefined;

  function confirmElimination() {
    if (pending !== null) {
      eliminate(pending);
      setPending(null);
    }
  }

  function newGame() {
    // On efface la partie en cours mais on garde les paramètres saisis,
    // puis on revient sur l'écran de création (pré-rempli).
    reset();
    navigate('/create');
  }

  return (
    <Layout>
      <h1>Vote</h1>
      <p className="muted">Cliquez sur le joueur à éliminer.</p>

      {remaining.map((p) => (
        <button key={p.order} className="list-item" onClick={() => setPending(p.order)}>
          <span>{p.name}</span>
          <span className="badge">éliminer</span>
        </button>
      ))}

      {eliminated.length > 0 && (
        <>
          <h2 style={{ marginTop: 16 }}>Éliminés</h2>
          {eliminated.map((order) => {
            const p = game.players.find((pl) => pl.order === order)!;
            return (
              <div key={order} className="list-item inactive">
                <span>{p.name}</span>
                <span className="badge">{ROLE_LABEL[p.role]}</span>
              </div>
            );
          })}
        </>
      )}

      <div className="spacer" />
      <button className="btn btn-block" onClick={newGame}>
        Terminer / Nouvelle partie
      </button>

      {/* Confirmation d'élimination + révélation du rôle */}
      {pendingPlayer && (
        <div className="card" style={{ marginTop: 12 }}>
          <p className="center">
            Éliminer <strong>{pendingPlayer.name}</strong> ?
          </p>
          <div className="row">
            <button className="btn" onClick={() => setPending(null)}>
              Annuler
            </button>
            <button className="btn btn-danger" onClick={confirmElimination}>
              Confirmer
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
