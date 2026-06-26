import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

/** Redirige vers le login admin si aucun mot de passe n'est en session. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const password = useAdminStore((s) => s.password);
  if (!password) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
