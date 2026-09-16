import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { PREDEFINED_MODELS } from './ProviderWizard';

export const ModelWizard = () => {
  const { activeProvider, apiKeys, customBaseUrl, setModel } = useAuthStore();
  const [models, setModels] = useState<{id: string, name: string, free?: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeProvider) {
      setError('Nenhum provedor ativo.');
      setLoading(false);
      return;
    }

    const key = apiKeys[activeProvider];
    if (!key) {
      setError('Chave de API não encontrada.');
      setLoading(false);
      return;
    }

    const loadModels = async () => {
      try {
        if (activeProvider === 'claude' || activeProvider === 'gemini') {
          setModels(PREDEFINED_MODELS[activeProvider] || []);
          setLoading(false);
          return;
        }

        let fetchUrl = customBaseUrl || '';
        if (activeProvider === 'openai') fetchUrl = 'https://api.openai.com/v1';
        if (activeProvider === 'nvidia') fetchUrl = 'https://integrate.api.nvidia.com/v1';
        
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

        if (!res.ok) throw new Error('Falha ao buscar modelos na API.');
        
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setModels(data.data.map((m: any) => ({ 
            id: m.id, 
            name: m.id,
            free: activeProvider === 'nvidia'
          })));
        } else {
          throw new Error('Formato incompatível retornado pela API.');
        }
      } catch (err: any) {
        console.error(err);
        setModels(PREDEFINED_MODELS[activeProvider] || [{ id: 'default', name: 'Default Model' }]);
      }
      setLoading(false);
    };

    loadModels();
  }, [activeProvider, apiKeys, customBaseUrl]);

  const handleSelect = (modelId: string) => {
    setModel(modelId);
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-[#111] border border-green-900 rounded p-4 text-green-400 font-mono text-sm max-w-sm mt-2">
        ✅ Modelo trocado com sucesso!
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111] border border-red-900 rounded p-4 text-red-400 font-mono text-sm max-w-sm mt-2">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4 mt-2 max-w-md w-full font-mono shadow-xl">
      <div className="text-term-accent font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-term-accent animate-pulse"></span>
        Trocar Modelo ({activeProvider})
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-gray-400 text-sm py-4 text-center">Buscando modelos disponíveis...</div>
        ) : (
          models.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className="px-4 py-2 bg-black hover:bg-gray-900 flex justify-between items-center rounded text-sm text-gray-300 transition-colors border border-gray-800 hover:border-gray-600"
            >
              <span className="truncate max-w-[80%]">{m.name}</span>
              {m.free && (
                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest shrink-0">Free</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
