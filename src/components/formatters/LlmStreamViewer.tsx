import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LlmStreamViewerProps {
  content: string;
}

const LlmStreamViewerComponent: React.FC<LlmStreamViewerProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-gray-800 prose-a:text-term-accent font-sans text-gray-300 py-2">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className={cn("font-mono text-xs block overflow-x-auto", className)} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-gray-800/50 px-1 py-0.5 rounded font-mono text-purple-300" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
      {/* If it's still streaming, show a little blinking cursor at the end */}
      <span className="inline-block w-2 h-4 bg-term-accent ml-1 animate-pulse align-middle" />
    </div>
  );
};

export const LlmStreamViewer = memo(LlmStreamViewerComponent);
