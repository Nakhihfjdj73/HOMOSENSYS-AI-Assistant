import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { api } from '@/services/api';

interface AssistantPanelProps {
  open: boolean;
  onClose: () => void;
  /** Scopes replies to a running session's FSM state. */
  sessionId?: number | null;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const FALLBACK_SUGGESTIONS = [
  'What is the current experiment step?',
  'What should I do next?',
  'Show current experiment status.',
  'Show the full procedure.',
];

export default function AssistantPanel({ open, onClose, sessionId }: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Suggestions come from the backend so they track the real procedure.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api
      .getSuggestions()
      .then((list) => {
        if (!cancelled && list.length) setSuggestions(list);
      })
      .catch(() => {
        // Keep the fallback list if the backend is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setPending(true);

    try {
      const response = await api.chat(trimmed, sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'request failed';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Assistant unavailable — ${detail}` },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-space-900/95 border-l border-space-600/40 z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-space-600/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent-500/15 border border-accent-400/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">ONBOARD AI ASSISTANT</div>
              <div className="flex items-center gap-1.5">
                <span className="status-dot bg-tealx-500 animate-pulse-slow" />
                <span className="text-[10px] text-tealx-400 font-medium">Context Aware</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-space-700/50 transition-colors">
            <X className="w-4 h-4 text-space-300" />
          </button>
        </div>

        {/* Grounding badge */}
        <div className="px-4 py-2 bg-amberx-500/10 border-b border-amberx-500/20">
          <span className="badge bg-amberx-500/15 text-amberx-400 border border-amberx-500/30">
            <Sparkles className="w-3 h-3" />
            GROUNDED IN VALIDATED EXPERIMENT STATE
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-10 h-10 text-space-500 mx-auto mb-3" />
              <p className="text-sm text-space-300 mb-1">AI Assistant ready</p>
              <p className="text-xs text-space-400">Ask a question or pick a suggestion below.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-accent-500/20 text-accent-100 border border-accent-500/30'
                    : 'bg-space-800/60 text-space-100 border border-space-600/40'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3 h-3 text-accent-400" />
                    <span className="text-[10px] font-semibold text-accent-400 tracking-wider">AI ASSISTANT</span>
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start">
              <div className="bg-space-800/60 border border-space-600/40 rounded-lg px-3 py-2">
                <span className="text-xs text-space-400">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="px-4 pb-3 space-y-1.5">
            <div className="text-[10px] font-semibold tracking-wider text-space-400 uppercase mb-2">Suggested Questions</div>
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => void ask(q)}
                className="w-full text-left px-3 py-2 rounded-md bg-space-800/60 border border-space-600/40 text-xs text-space-200 hover:border-accent-400/40 hover:text-accent-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-space-600/40">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void ask(input)}
              placeholder="Ask the assistant..."
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={() => void ask(input)}
              disabled={pending}
              className="p-2 rounded-md bg-accent-500 hover:bg-accent-400 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
