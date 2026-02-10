import { create } from 'zustand';

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  isMandatory: boolean;
  durationMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress: number;
  score?: number;
  completedAt?: string;
  certificateUrl?: string;
  expiresAt?: string;
}

export interface TrainingState {
  modules: TrainingModule[];
  currentModuleId: string | null;
  loading: boolean;
  error: string | null;
  setModules: (modules: TrainingModule[]) => void;
  setCurrentModule: (id: string | null) => void;
  updateModuleProgress: (id: string, progress: number, status: TrainingModule['status']) => void;
  completeModule: (id: string, score: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCompletionStats: () => { completed: number; total: number; percentage: number };
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  modules: [],
  currentModuleId: null,
  loading: false,
  error: null,

  setModules: (modules) => set({ modules, error: null }),

  setCurrentModule: (id) => set({ currentModuleId: id }),

  updateModuleProgress: (id, progress, status) => set((state) => ({
    modules: state.modules.map((mod) =>
      mod.id === id ? { ...mod, progress, status } : mod
    ),
  })),

  completeModule: (id, score) => set((state) => ({
    modules: state.modules.map((mod) =>
      mod.id === id 
        ? { 
            ...mod, 
            status: 'completed', 
            score, 
            progress: 100,
            completedAt: new Date().toISOString()
          } 
        : mod
    ),
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  getCompletionStats: () => {
    const { modules } = get();
    const completed = modules.filter((m) => m.status === 'completed').length;
    return {
      completed,
      total: modules.length,
      percentage: modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0,
    };
  },
}));
