import React, { useState } from 'react';
import { useAuthStore, type LlmProvider } from '@/store/authStore';

const PROVIDERS: { id: LlmProvider, name: string, isCustom?: boolean }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'claude', name: 'Anthropic Claude' },
  { id: 'nvidia', name: 'NVIDIA NIM' },
  { id: 'custom', name: 'Custom Endpoint (OpenAI API)', isCustom: true }
];

export const PREDEFINED_MODELS: Record<string, { id: string, name: string, free?: boolean }[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'o1-preview', name: 'o1-Preview' },
    { id: 'o1-mini', name: 'o1-Mini' },
  ],
  gemini: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', free: true },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', free: true },
  ],
  claude: [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  nvidia: [
    { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct' },
    { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct' },
    { id: 'nv-mistralai/mistral-nemo-12b-instruct', name: 'Mistral NeMo 12B', free: true },
  ]
};

export const ProviderWizard = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<{id: string, name: string, free?: boolean}[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const { setProvider, setApiKey: saveApiKey, setCustomBaseUrl, setModel } = useAuthStore();

  const handleProviderSelect = (prov: LlmProvider) => {
    setSelectedProvider(prov);
    if (prov === 'custom') {
      setStep(2); // Ask for baseUrl first
    } else {
      setStep(3); // Go straight to API Key
    }
  };

  const handleBaseUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (baseUrl.trim()) {
      setCustomBaseUrl(baseUrl.trim());
      setStep(3);
    }
  };

  const loadModelsForProvider = async (prov: LlmProvider, key: string, url: string) => {
    setLoadingModels(true);
    setStep(4);
    
    try {
      if (prov === 'claude' || prov === 'gemini') {
        // These don't have standard OpenAI-compatible /models endpoints readily accessible
        setModels(PREDEFINED_MODELS[prov] || []);
        setLoadingModels(false);
        return;
      }

      let fetchUrl = url;
      if (prov === 'openai') fetchUrl = 'https://api.openai.com/v1';
      if (prov === 'nvidia') fetchUrl = 'https://integrate.api.nvidia.com/v1';
      
      const cleanUrl = fetchUrl.replace(/\/$/, '');
      
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: `${cleanUrl}/models`,
          method: 'GET',
          headers: { 'Authorization': `Bearer ${key}` }
        })
      });

      if (!res.ok) throw new Error('Falha ao buscar modelos');
      
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setModels(data.data.map((m: any) => ({ 
          id: m.id, 
          name: m.id,
          free: prov === 'nvidia' // Just marking all as free based on user's hint, or we can check
        })));
      } else {
        throw new Error('Formato de resposta incompatível');
      }
    } catch (err) {
      console.error('Model fetch failed, using fallback:', err);
      // Fallback
      setModels(PREDEFINED_MODELS[prov] || [{ id: 'default', name: 'Default Model' }]);
    }
    
    setLoadingModels(false);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() && selectedProvider) {
      saveApiKey(selectedProvider, apiKey.trim());
      setProvider(selectedProvider);
      
      // Load models
      loadModelsForProvider(selectedProvider, apiKey.trim(), baseUrl);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setStep(5); // Done
  };

  if (step === 5) {
    return (
      <div className="bg-[#111] border border-green-900 rounded p-4 text-green-400 font-mono text-sm max-w-sm mt-2">
        ✅ Provedor <strong>{selectedProvider}</strong> configurado com sucesso!
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4 mt-2 max-w-md w-full font-mono shadow-xl">
      <div className="text-term-accent font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-term-accent animate-pulse"></span>
        {step === 1 && '1. Selecione o Provedor de IA'}
        {step === 2 && '2. Configurar Endpoint URL'}
        {step === 3 && '3. Inserir API Key'}
        {step === 4 && '4. Selecionar Modelo'}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-2">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderSelect(p.id)}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-left rounded text-sm text-gray-300 transition-colors border border-gray-800 hover:border-gray-600"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleBaseUrlSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://sua-api.com/v1"
            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-term-accent"
            autoFocus
          />
          <button type="submit" className="bg-term-accent hover:bg-cyan-300 text-black font-bold py-2 rounded text-sm transition-colors">
            Continuar
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleApiKeySubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-term-accent"
            autoFocus
          />
          <div className="text-[10px] text-gray-500 italic">
            * Chave persistida de forma segura no localStorage (Client-Side).
          </div>
          <button type="submit" className="bg-term-accent hover:bg-cyan-300 text-black font-bold py-2 rounded text-sm transition-colors">
            Conectar e Buscar Modelos
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-2">
          {loadingModels ? (
            <div className="text-gray-400 text-sm py-4 text-center">Buscando modelos...</div>
          ) : (
            models.map(m => (
              <button
                key={m.id}
                onClick={() => handleModelSelect(m.id)}
                className="px-4 py-2 bg-black hover:bg-gray-900 flex justify-between items-center rounded text-sm text-gray-300 transition-colors border border-gray-800 hover:border-gray-600"
              >
                <span>{m.name}</span>
                {m.free && (
                  <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Free</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
