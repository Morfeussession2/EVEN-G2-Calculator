import * as React from 'react';
import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────

export interface ToolCall {
  name: string;
  input?: string;
  output?: string;
  status?: 'running' | 'complete' | 'error';
}

export interface CodeBlock {
  language?: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  thinking?: string;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  codeBlocks?: CodeBlock[];
  diff?: string;
  error?: string;
  command?: string;
}

// ─── ChatThinking ───────────────────────────────────────────────

interface ChatThinkingProps {
  content: string;
  className?: string;
}

function ChatThinking({ content, className }: ChatThinkingProps) {
  const [expanded, setExpanded] = React.useState(false);
  const summary = content.length > 80 ? content.slice(0, 80) + '...' : content;

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className={cn('text-left w-full', className)}
    >
      <div className="flex items-center gap-1 text-[13px] tracking-[-0.13px] text-text-dim cursor-pointer hover:text-text transition-colors">
        <span>{expanded ? '\u25BE' : '\u25B8'}</span>
        <span className="italic">Thinking...</span>
      </div>
      {expanded && (
        <div className="border-l-2 border-accent pl-3 py-1 mt-1 text-[13px] tracking-[-0.13px] text-text-dim italic whitespace-pre-wrap">
          {content}
        </div>
      )}
      {!expanded && (
        <div className="border-l-2 border-accent pl-3 py-1 mt-1 text-[11px] tracking-[-0.11px] text-text-muted truncate">
          {summary}
        </div>
      )}
    </button>
  );
}

// ─── ChatCodeBlock ──────────────────────────────────────────────

interface ChatCodeBlockProps {
  language?: string;
  content: string;
  className?: string;
}

function ChatCodeBlock({ language, content, className }: ChatCodeBlockProps) {
  const lines = content.split('\n');

  return (
    <div className={cn('bg-surface-lighter rounded-[6px] overflow-hidden', className)}>
      {language && (
        <div className="px-3 py-1.5 text-[11px] tracking-[-0.11px] text-text-muted border-b border-border/30">
          {language}
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="px-3 py-2 font-mono text-[13px] tracking-[-0.13px] text-text leading-5">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 text-right pr-3 text-text-muted select-none">{i + 1}</span>
              <span className="whitespace-pre-wrap break-all">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ─── ChatDiff ───────────────────────────────────────────────────

interface ChatDiffProps {
  content: string;
  className?: string;
}

function ChatDiff({ content, className }: ChatDiffProps) {
  const lines = content.split('\n');

  return (
    <div className={cn('rounded-[6px] overflow-hidden font-mono text-[13px] tracking-[-0.13px]', className)}>
      {lines.map((line, i) => {
        let bg = '';
        let textColor = 'text-text';
        if (line.startsWith('@@')) {
          bg = 'bg-accent/10';
          textColor = 'text-accent';
        } else if (line.startsWith('+')) {
          bg = 'bg-positive/10';
          textColor = 'text-positive';
        } else if (line.startsWith('-')) {
          bg = 'bg-negative/10';
          textColor = 'text-negative';
        }
        return (
          <div key={i} className={cn('px-3 py-0.5 whitespace-pre-wrap', bg, textColor)}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

// ─── ChatToolCall ───────────────────────────────────────────────

interface ChatToolCallProps {
  toolCall: ToolCall;
  className?: string;
}

function ChatToolCall({ toolCall, className }: ChatToolCallProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cn('bg-surface-lighter rounded-[6px] overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-light/50 transition-colors"
      >
        {/* Status indicator */}
        {toolCall.status === 'running' && (
          <div className="w-3 h-3 animate-spin rounded-full border border-surface-lighter border-t-accent shrink-0" />
        )}
        {toolCall.status === 'complete' && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-positive shrink-0"><rect x={2} y={6} width={2} height={2} fill="currentColor" /><rect x={4} y={8} width={2} height={2} fill="currentColor" /><rect x={6} y={6} width={2} height={2} fill="currentColor" /><rect x={8} y={4} width={2} height={2} fill="currentColor" /></svg>
        )}
        {toolCall.status === 'error' && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-negative shrink-0"><rect x={2} y={2} width={2} height={2} fill="currentColor" /><rect x={4} y={4} width={2} height={2} fill="currentColor" /><rect x={6} y={6} width={2} height={2} fill="currentColor" /><rect x={8} y={8} width={2} height={2} fill="currentColor" /><rect x={8} y={2} width={2} height={2} fill="currentColor" /><rect x={6} y={4} width={2} height={2} fill="currentColor" /><rect x={4} y={6} width={2} height={2} fill="currentColor" /><rect x={2} y={8} width={2} height={2} fill="currentColor" /></svg>
        )}
        {!toolCall.status && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-text-dim shrink-0"><rect x={1} y={3} width={4} height={2} fill="currentColor" /><rect x={3} y={5} width={2} height={2} fill="currentColor" /><rect x={5} y={5} width={4} height={2} fill="currentColor" /><rect x={7} y={7} width={2} height={2} fill="currentColor" /></svg>
        )}
        <span className="font-mono text-[13px] tracking-[-0.13px] text-text">{toolCall.name}</span>
        <span className="ml-auto text-[11px] text-text-muted">{expanded ? '\u25BE' : '\u25B8'}</span>
      </button>
      {expanded && (
        <div className="border-t border-border/30 px-3 py-2 font-mono text-[13px] tracking-[-0.13px]">
          {toolCall.input && (
            <div className="mb-2">
              <div className="text-[11px] text-text-muted mb-1">Input</div>
              <pre className="whitespace-pre-wrap text-text-dim">{toolCall.input}</pre>
            </div>
          )}
          {toolCall.output && (
            <div>
              <div className="text-[11px] text-text-muted mb-1">Output</div>
              <pre className="whitespace-pre-wrap text-text-dim">{toolCall.output}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ChatCommand ────────────────────────────────────────────────

interface ChatCommandProps {
  command: string;
  output?: string;
  className?: string;
}

function ChatCommand({ command, output, className }: ChatCommandProps) {
  return (
    <div className={cn('font-mono text-[13px] tracking-[-0.13px]', className)}>
      <div className="flex items-center gap-1 text-text">
        <span className="text-text-dim">$</span>
        <span>{command}</span>
      </div>
      {output && (
        <pre className="whitespace-pre-wrap text-text-dim mt-1">{output}</pre>
      )}
    </div>
  );
}

// ─── ChatError ──────────────────────────────────────────────────

interface ChatErrorProps {
  message: string;
  className?: string;
}

function ChatError({ message, className }: ChatErrorProps) {
  return (
    <div className={cn('bg-negative/10 text-negative rounded-[6px] px-3 py-2 text-[13px] tracking-[-0.13px]', className)}>
      {message}
    </div>
  );
}

// ─── Content Parser ─────────────────────────────────────────────

function parseAssistantContent(content: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      blocks.push(<span key={`t-${blocks.length}`}>{textBuffer.join('\n')}</span>);
      textBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (line.startsWith('```')) {
      flushText();
      const lang = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(<ChatCodeBlock key={`c-${blocks.length}`} language={lang} content={codeLines.join('\n')} />);
      i++; // skip closing ```
      continue;
    }

    // Diff block (consecutive +/- lines)
    if ((line.startsWith('@@') || line.startsWith('+') || line.startsWith('-')) && i + 1 < lines.length) {
      const diffStart = i;
      const diffLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('@@') || lines[i].startsWith('+') || lines[i].startsWith('-') || lines[i].startsWith(' '))) {
        diffLines.push(lines[i]);
        i++;
        // Stop if we've captured a meaningful diff (at least 2 lines starting with +/-)
        if (diffLines.length > 1 && i < lines.length && !lines[i].startsWith('@@') && !lines[i].startsWith('+') && !lines[i].startsWith('-') && !lines[i].startsWith(' ')) break;
      }
      if (diffLines.length >= 2 && diffLines.some(l => l.startsWith('+') || l.startsWith('-'))) {
        flushText();
        blocks.push(<ChatDiff key={`d-${blocks.length}`} content={diffLines.join('\n')} />);
        continue;
      }
      // Not a real diff, treat as text
      i = diffStart;
    }

    // Tool call line: >> toolName
    if (line.startsWith('>> ')) {
      flushText();
      const name = line.slice(3).trim();
      blocks.push(<ChatToolCall key={`tc-${blocks.length}`} toolCall={{ name, status: 'complete' }} />);
      i++;
      continue;
    }

    // Error line: ! message
    if (line.startsWith('! ')) {
      flushText();
      blocks.push(<ChatError key={`e-${blocks.length}`} message={line.slice(2)} />);
      i++;
      continue;
    }

    // Command line: $ command
    if (line.startsWith('$ ')) {
      flushText();
      blocks.push(<ChatCommand key={`cmd-${blocks.length}`} command={line.slice(2)} />);
      i++;
      continue;
    }

    textBuffer.push(line);
    i++;
  }

  flushText();
  return blocks;
}

// ─── ChatBubble ─────────────────────────────────────────────────

interface ChatBubbleProps {
  message: ChatMessage;
  className?: string;
}

function ChatBubble({ message, className }: ChatBubbleProps) {
  const { role, content, thinking, isStreaming, toolCalls, codeBlocks, diff, error, command, timestamp } = message;

  if (role === 'system') {
    return (
      <div className={cn('flex justify-center py-2', className)}>
        <span className="text-[13px] tracking-[-0.13px] text-text-dim">{content}</span>
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start', 'mb-3', className)}>
      <div className="max-w-[85%] flex flex-col gap-1.5">
        {/* Thinking block */}
        {thinking && <ChatThinking content={thinking} />}

        {/* Main bubble */}
        <div
          className={cn(
            'px-4 py-3 text-[15px] tracking-[-0.15px]',
            isUser
              ? 'bg-accent text-text-highlight rounded-[6px] rounded-br-none'
              : 'bg-surface text-text rounded-[6px] rounded-bl-none',
          )}
        >
          {isUser ? content : (
            <div className="flex flex-col gap-2">
              {parseAssistantContent(content)}
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-[2px] h-[15px] bg-current ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>

        {/* Code blocks (explicit) */}
        {codeBlocks?.map((cb, i) => (
          <ChatCodeBlock key={`cb-${i}`} language={cb.language} content={cb.content} />
        ))}

        {/* Diff (explicit) */}
        {diff && <ChatDiff content={diff} />}

        {/* Command (explicit) */}
        {command && <ChatCommand command={command} />}

        {/* Tool calls */}
        {toolCalls?.map((tc, i) => (
          <ChatToolCall key={`tc-${i}`} toolCall={tc} />
        ))}

        {/* Error */}
        {error && <ChatError message={error} />}

        {/* Timestamp */}
        {timestamp && (
          <span className={cn('text-[11px] tracking-[-0.11px] text-text-muted', isUser ? 'text-right' : 'text-left')}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ChatInput ──────────────────────────────────────────────────

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function ChatInput({ value, onChange, onSend, placeholder = 'Type a message...', disabled, className }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  };

  // Auto-grow textarea
  React.useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = '0';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [value]);

  return (
    <div className={cn('flex items-end gap-2 p-3 bg-bg', className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-input-bg text-text rounded-[6px] px-4 py-3 text-[15px] tracking-[-0.15px] outline-none placeholder:text-text-dim resize-none min-h-[44px] max-h-[120px]"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 h-11 w-11 rounded-[6px] bg-accent text-text-highlight flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x={10} y={4} width={2} height={2} fill="currentColor" />
          <rect x={10} y={6} width={2} height={2} fill="currentColor" />
          <rect x={10} y={8} width={2} height={2} fill="currentColor" />
          <rect x={10} y={10} width={2} height={2} fill="currentColor" />
          <rect x={10} y={12} width={2} height={2} fill="currentColor" />
          <rect x={10} y={14} width={2} height={2} fill="currentColor" />
          <rect x={10} y={16} width={2} height={2} fill="currentColor" />
          <rect x={8} y={6} width={2} height={2} fill="currentColor" />
          <rect x={12} y={6} width={2} height={2} fill="currentColor" />
          <rect x={6} y={8} width={2} height={2} fill="currentColor" />
          <rect x={14} y={8} width={2} height={2} fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

// ─── ChatContainer ──────────────────────────────────────────────

interface ChatContainerProps {
  messages: ChatMessage[];
  input?: ReactNode;
  className?: string;
}

function ChatContainer({ messages, input, className }: ChatContainerProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>
      {input}
    </div>
  );
}

export { ChatContainer, ChatBubble, ChatInput, ChatThinking, ChatCodeBlock, ChatDiff, ChatToolCall, ChatCommand, ChatError };
export type { ChatContainerProps, ChatBubbleProps, ChatInputProps };
