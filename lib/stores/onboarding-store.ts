import { create } from 'zustand';

export interface OnboardingDocument {
  id: string;
  title: string;
  category: string;
  isRequired: boolean;
  dueDate: string;
  acknowledged: boolean;
  completedAt?: string;
  signature?: string;
}

export interface OnboardingState {
  documents: OnboardingDocument[];
  currentDocId: string | null;
  loading: boolean;
  error: string | null;
  setDocuments: (docs: OnboardingDocument[]) => void;
  setCurrentDoc: (docId: string | null) => void;
  updateDocument: (id: string, updates: Partial<OnboardingDocument>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getProgress: () => number;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  documents: [],
  currentDocId: null,
  loading: false,
  error: null,

  setDocuments: (documents) => set({ documents, error: null }),

  setCurrentDoc: (docId) => set({ currentDocId: docId }),

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, ...updates } : doc
    ),
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  getProgress: () => {
    const { documents } = get();
    if (documents.length === 0) return 0;
    const completed = documents.filter((doc) => doc.acknowledged).length;
    return Math.round((completed / documents.length) * 100);
  },
}));
