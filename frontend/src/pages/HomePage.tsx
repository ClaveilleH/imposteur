import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

// Une accroche est tirée au hasard à chaque chargement de la page.
const TAGLINES = [
  'Made by Claude 🤖, helped by Hugo (il tenait le téléphone).',
  'Made by Claude 🤖, helped by Hugo (il a fourni le café).',
  'Made by Claude 🤖, helped by Hugo (il a dit « ouais c\'est bien »).',
  'Made by Claude 🤖, helped by Hugo (support moral uniquement).',
  'Made by Claude 🤖, helped by Hugo (il connaissait le mot de passe du VPS).',
  'Made by Claude 🤖, helped by Hugo (il a appuyé sur Entrée avec brio).',
  'Made by Claude 🤖, helped by Hugo (chef de projet auto-proclamé).',
  'Made by Claude 🤖, helped by Hugo (il a trouvé l\'idée, c\'est déjà ça).',
  'Made by Claude 🤖, helped by Hugo (débogage émotionnel).',
];

function randomTagline(): string {
  return TAGLINES[Math.floor(Math.random() * TAGLINES.length)]!;
}

export function HomePage() {
  // Tirée une fois au montage : stable pendant la visite, nouvelle à chaque refresh.
  const [tagline] = useState(randomTagline);

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
      <p className="muted center">{tagline}</p>
    </Layout>
  );
}
