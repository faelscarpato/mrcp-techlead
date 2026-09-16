import { Terminal } from '@/components/terminal/Terminal';

export default function Home() {
  return (
    <main className="flex-1 w-full h-full flex flex-col bg-term-bg border-t-4 border-term-border">
      {/* Optional: Add a top bar here if needed in the future */}
      <div className="flex items-center justify-between px-4 py-2 bg-term-border text-term-dim text-xs font-sans tracking-wider border-b border-black">
        <span className="font-bold tracking-widest text-term-text/70">MRCP WEB TERMINAL // v1.0.0</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-term-accent animate-pulse"></span>
          SYSTEM ONLINE
        </span>
      </div>
      
      {/* Terminal Container */}
      <div className="flex-1 overflow-hidden relative">
        <Terminal />
      </div>
    </main>
  );
}
