import { create } from 'zustand';

const STORAGE_KEY = 'impostor.adminPassword';

/**
 * Session admin minimaliste : on conserve le mot de passe en localStorage
 * et on le renvoie à chaque requête admin. (Sécurité hors périmètre.)
 */
interface AdminState {
  password: string | null;
  login: (password: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  password: localStorage.getItem(STORAGE_KEY),
  login: (password) => {
    localStorage.setItem(STORAGE_KEY, password);
    set({ password });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ password: null });
  },
}));
