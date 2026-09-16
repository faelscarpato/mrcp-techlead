import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LlmProvider = 'openai' | 'gemini' | 'claude' | 'nvidia' | 'custom';

interface AuthState {
  activeProvider: LlmProvider | null;
  apiKeys: Partial<Record<LlmProvider, string>>;
  customBaseUrl: string | null;
  activeModel: string | null;
  hasHydrated: boolean;
  
  setProvider: (provider: LlmProvider) => void;
  setApiKey: (provider: LlmProvider, key: string) => void;
  setCustomBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setHasHydrated: (state: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      activeProvider: null,
      apiKeys: {},
      customBaseUrl: null,
      activeModel: null,
      hasHydrated: false,
      
      setProvider: (activeProvider) => set({ activeProvider }),
      setApiKey: (provider, key) => set((state) => ({ 
        apiKeys: { ...state.apiKeys, [provider]: key } 
      })),
      setCustomBaseUrl: (customBaseUrl) => set({ customBaseUrl }),
      setModel: (activeModel) => set({ activeModel }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearAll: () => set({ activeProvider: null, apiKeys: {}, customBaseUrl: null, activeModel: null }),
    }),
    {
      name: 'mrcp-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
