import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { adminLogin } from '../../api/admin.api';
import { ApiError } from '../../api/client';
import { useAdminStore } from '../../store/adminStore';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminStore((s) => s.login);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await adminLogin(password);
      login(password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur inattendue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1>Administration</h1>
      {error && <div className="error">{error}</div>}
      <div className="field">
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <button className="btn btn-primary btn-block" disabled={loading} onClick={handleSubmit}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </Layout>
  );
}
