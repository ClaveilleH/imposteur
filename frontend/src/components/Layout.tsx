import type { ReactNode } from 'react';

/** Conteneur mobile-first commun à toutes les pages. */
export function Layout({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>;
}
