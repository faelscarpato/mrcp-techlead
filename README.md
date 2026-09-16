<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/terminal-square.svg" alt="MRCP Terminal Logo" width="100" height="100" />
  
  # MRCP Web Terminal
  
  **O Próximo Salto Evolutivo das Interfaces de Linha de Comando.** <br/>
  Um ambiente "Chat-CLI" híbrido projetado para orquestração de LLMs e Análise Estrutural de Código (AST).

  [![Next.js](https://img.shields.io/badge/Next.js-15.0+-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Zustand](https://img.shields.io/badge/Zustand-State_Management-yellow)](https://github.com/pmndrs/zustand)
</div>

---

## 🌌 Visão Geral

O **MRCP Web Terminal** abandona a interface engessada de TTY clássica e introduz um paradigma **Chat-CLI**. Em vez de apenas responder a comandos de texto estáticos, o terminal age como um feed inteligente e interativo:

- Digite `/` para acessar comandos nativos (como configurar a API ou analisar um repositório).
- Digite **texto livre** para iniciar um bate-papo em tempo real com a Inteligência Artificial, utilizando streaming de Markdown.
- Interfaces gráficas interativas (Wizards) são renderizadas _diretamente no fluxo do histórico_, elevando a Developer Experience (DX) ao nível das ferramentas mais modernas do mercado (ex: Cursor, Vercel v0).

## ✨ Principais Funcionalidades

### 🧠 Bate-Papo Nativo & Streaming LLM
Fale naturalmente com a IA. O orquestrador LLM integrado (`llmOrchestrator.ts`) envia seus prompts para provedores como OpenAI, Google Gemini, Anthropic Claude, e NVIDIA NIM, retornando a resposta em blocos estilo chat (Markdown Stream) diretamente no Terminal.

### 🛡️ Bring Your Own Key (BYOK) - Seguro & Client-Side
Sua chave de API nunca é gravada em banco de dados. O estado de autenticação é gerenciado via **Zustand Persist**, criptografando ou ofuscando as chaves puramente no `localStorage` do seu navegador. 

### ⚡ Proxy Serverless Anti-CORS
Sistemas Client-Side costumam falhar ao bater diretamente em APIs como a da NVIDIA devido a políticas estritas de CORS. O MRCP Terminal inclui uma rota transparente (`/api/proxy`) no servidor Next.js, mascarando a origem e permitindo chamadas diretas (incluindo Streaming e Listagem de Modelos Reais) sem bloqueios de segurança do navegador.

### 🧙‍♂️ Wizards Interativos In-Feed
Os comandos de configuração deixaram de ser dor de cabeça. 
- `/provedores`: Renderiza um painel visual para você selecionar o provedor, inserir a URL (se customizado), injetar a API Key e buscar os **modelos reais** disponíveis.
- `/model`: Permite a troca expressa de modelo sem refazer a autenticação.

### 📦 Opt-In Context Injection (Zero-Waste Tokens)
Quando você pede para a engine do MRCP analisar um repositório (`/mrcp analyze <url>`), o sistema renderiza uma Tabela ASCII pesada e visual. Em vez de enviar toda essa "AST massiva" à força para a IA (gastando seus tokens e poluindo o contexto), o terminal oferece botões de ação sob demanda:
- `[ 📥 Baixar Análise ]`: Salva o JSON bruto na máquina.
- `[ 🧠 Enviar para a IA ]`: Injeta a AST no cérebro do LLM silenciosamente e foca o cursor para você dizer o que deseja refatorar.

### 📱 Responsividade Extrema (Mobile First)
Projetado para codar na rua. O design utiliza as diretrizes de Viewport Dinâmico (`100dvh`), `safe-area-inset`, e o novo *Interactive Widget Meta Tag* para garantir que **Teclados Virtuais (Android/iOS)** nunca cubram o `Omnibox`. Além disso, possui uma _Mobile Toolbar_ com atalhos de hardware (ESC, TAB, UP, DOWN) nativos.

---

## 🛠️ Tecnologias Utilizadas

- **Core:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Componentes:** `react-textarea-autosize`, `lucide-react`, `react-markdown`

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js v18.17+ 
- npm, yarn, pnpm, ou bun

### Passos da Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/mrcp-web-terminal.git
cd mrcp-web-terminal
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento (Turbopack suportado):
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🎮 Comandos Disponíveis (Command Palette)

Basta começar a digitar `/` no Omnibox para abrir o menu auto-completável:

| Comando | Descrição |
| :--- | :--- |
| `/provedores` | Inicia o Wizard para configurar e autenticar seu provedor de LLM. |
| `/model` | Inicia o Wizard para trocar o modelo de IA do provedor ativo. |
| `/mrcp analyze <url>` | Executa a extração do Grafo Estrutural (AST) e complexidade de um repositório. |
| `/mrcp health <url>` | Faz o *scoring* de integridade de código, listando os piores débitos técnicos. |
| `/mrcp audit <url>` | Roda a verificação de conformidade de segurança e análise estática. |
| `/clear` | Limpa completamente a tela e o histórico de blocos do chat. |

_Qualquer texto digitado **sem** uma barra invertida inicial (ex: "Qual é o melhor design pattern para este código?") será tratado como Chat Nativo e enviado diretamente à IA configurada._

---

## 🤝 Contribuindo

Pull requests são sempre bem-vindos! Se você encontrar um bug ou tiver sugestões de melhoria de UX, abra uma _issue_ no GitHub. O projeto está aberto a expansões, como a criação de novos provedores (ex: Groq, Perplexity) e novos comandos nativos do MRCP.

## 📝 Licença

Desenvolvido sob arquitetura e conceitos _OpenCode_. Livre para uso e modificações.
