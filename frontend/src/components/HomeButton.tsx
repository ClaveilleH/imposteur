import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

/**
 * Bouton discret de retour à l'accueil, affiché sur les écrans de jeu.
 * Réinitialise la partie en cours (mais conserve les derniers paramètres saisis).
 */
export function HomeButton() {
  const navigate = useNavigate();
  const reset = useGameStore((s) => s.reset);

  return (
    <button
      type="button"
      className="btn"
      style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.85rem' }}
      onClick={() => {
        reset();
        navigate('/');
      }}
    >
      ← Accueil
    </button>
  );
}
