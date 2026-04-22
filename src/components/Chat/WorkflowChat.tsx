// components/Chat/WorkflowChat.tsx — Floating Chat Widget for Quick Workflow Generation
// v3: Taller panel, bullet-proof suggestions, no broken commands, premium UX

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquarePlus,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Command,
  Trash2,
  ChevronDown,
  Box,
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import {
  generateWorkflow,
  applyModifiersToExisting,
  getAutocompleteSuggestions,
  exampleCommands,
  type Suggestion,
  type AutocompleteSuggestion,
} from '../../engine/chatCommandEngine';

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: number;
  details?: {
    baseWorkflow?: string;
    modifiers?: string[];
    nodeCount?: number;
    edgeCount?: number;
  };
  suggestions?: Suggestion[];
  status?: 'success' | 'error' | 'info';
}

interface WorkflowChatProps {
  onGenerateWorkflow: (nodes: Node[], edges: Edge[]) => void;
  existingNodes: Node[];
  existingEdges: Edge[];
}

// ──────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────

const WorkflowChat = ({ onGenerateWorkflow, existingNodes, existingEdges }: WorkflowChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [autocomplete, setAutocomplete] = useState<AutocompleteSuggestion[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refs for latest prop values inside setTimeout callbacks
  const existingNodesRef = useRef(existingNodes);
  const existingEdgesRef = useRef(existingEdges);
  const onGenerateRef = useRef(onGenerateWorkflow);

  useEffect(() => { existingNodesRef.current = existingNodes; }, [existingNodes]);
  useEffect(() => { existingEdgesRef.current = existingEdges; }, [existingEdges]);
  useEffect(() => { onGenerateRef.current = onGenerateWorkflow; }, [onGenerateWorkflow]);

  // Cycle placeholder
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % exampleCommands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global keyboard shortcut: "/" to open chat (when not typing elsewhere)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
      if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Autocomplete
  useEffect(() => {
    if (inputValue.length >= 2) {
      const results = getAutocompleteSuggestions(inputValue);
      setAutocomplete(results);
      setShowAutocomplete(results.length > 0);
    } else {
      setAutocomplete([]);
      setShowAutocomplete(false);
    }
  }, [inputValue]);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: Date.now() }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // ──── Core Logic: Process a command string ────
  const processCommand = useCallback((text: string) => {
    const currentNodes = existingNodesRef.current;
    const currentEdges = existingEdgesRef.current;
    const generate = onGenerateRef.current;

    // Try to apply modifiers to existing workflow first
    if (currentNodes.length > 0) {
      const modResult = applyModifiersToExisting(text, currentNodes, currentEdges);
      if (modResult) {
        generate(modResult.nodes, modResult.edges);
        addMessage({
          role: 'system',
          content: `Updated workflow — ${modResult.appliedModifiers.join(', ')}`,
          status: 'success',
          details: {
            modifiers: modResult.appliedModifiers,
            nodeCount: modResult.nodes.length,
            edgeCount: modResult.edges.length,
          },
          suggestions: modResult.suggestions,
        });
        return true;
      }
    }

    // Try to generate a brand new workflow
    const result = generateWorkflow(text);
    if (result) {
      generate(result.nodes, result.edges);
      const baseName = result.description.split('•')[0].replace('Base: ', '').trim();
      addMessage({
        role: 'system',
        content: `Generated **${baseName}** workflow`,
        status: 'success',
        details: {
          baseWorkflow: baseName,
          modifiers: result.appliedModifiers,
          nodeCount: result.nodes.length,
          edgeCount: result.edges.length,
        },
        suggestions: result.suggestions,
      });
      return true;
    }

    // Nothing matched — show helpful suggestions
    addMessage({
      role: 'system',
      content: `Couldn't match that command. Try one of these:`,
      status: 'error',
      suggestions: [
        { id: 'h1', label: 'Leave approval', icon: '🏖️', command: 'leave approval' },
        { id: 'h2', label: 'Onboarding', icon: '👋', command: 'employee onboarding' },
        { id: 'h3', label: 'Expense claim', icon: '💰', command: 'expense approval' },
        { id: 'h4', label: 'Employee transfer', icon: '🔄', command: 'employee transfer' },
        { id: 'h5', label: 'Performance review', icon: '📊', command: 'performance review' },
        { id: 'h6', label: 'Offboarding', icon: '📦', command: 'employee offboarding' },
      ],
    });
    return false;
  }, [addMessage]);

  // Handle command submission
  const handleSubmit = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;

    setShowAutocomplete(false);
    setIsProcessing(true);
    addMessage({ role: 'user', content: text });
    setInputValue('');

    setTimeout(() => {
      processCommand(text);
      setIsProcessing(false);
    }, 500);
  }, [inputValue, isProcessing, addMessage, processCommand]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage({ role: 'user', content: suggestion.command });

    setTimeout(() => {
      processCommand(suggestion.command);
      setIsProcessing(false);
      setInputValue('');
    }, 500);
  }, [isProcessing, addMessage, processCommand]);

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((suggestion: AutocompleteSuggestion) => {
    if (suggestion.category === 'modifier') {
      const baseMatch = inputValue.match(/^([\w\s]+?)(?:\s+with\s+|$)/i);
      setInputValue(`${baseMatch?.[1] || inputValue} ${suggestion.text}`);
    } else {
      setInputValue(suggestion.text);
    }
    setShowAutocomplete(false);
    inputRef.current?.focus();
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowAutocomplete(false);
      if (!inputValue) setIsOpen(false);
    }
  };

  const hasMessages = messages.length > 0;

  // ──── Render ────
  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          title="Quick Workflow Builder ( / )"
          id="chat-fab-toggle"
        >
          <MessageSquarePlus size={18} />
          <span className="chat-fab-label">Quick Build</span>
          <kbd className="chat-fab-kbd">/</kbd>
        </button>
      )}

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon-wrap">
              <Sparkles size={14} />
            </div>
            <span className="chat-header-title">Workflow Builder</span>
            <span className="chat-header-badge">Command</span>
          </div>
          <div className="chat-header-actions">
            {hasMessages && (
              <button
                className="chat-header-btn"
                onClick={clearMessages}
                title="Clear history"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              className="chat-header-btn chat-header-close"
              onClick={() => setIsOpen(false)}
              title="Close (Esc)"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="chat-body">
          {/* Welcome state */}
          {!hasMessages && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Command size={22} />
              </div>
              <h4>Build Workflows Instantly</h4>
              <p>Type a command to generate structured workflows. Smart keyword matching — no AI needed.</p>

              <div className="chat-examples">
                <span className="chat-examples-label">Quick start</span>
                {exampleCommands.slice(0, 4).map((cmd, i) => (
                  <button
                    key={i}
                    className="chat-example-chip"
                    onClick={() => { setInputValue(cmd); inputRef.current?.focus(); }}
                  >
                    <Zap size={10} />
                    <span>{cmd}</span>
                    <ArrowRight size={10} className="chat-example-arrow" />
                  </button>
                ))}
              </div>

              <div className="chat-templates-grid">
                <span className="chat-examples-label">Available workflows</span>
                <div className="chat-templates-row">
                  {[
                    { label: 'Leave Approval', icon: '🏖️', cmd: 'leave approval' },
                    { label: 'Onboarding', icon: '👋', cmd: 'employee onboarding' },
                    { label: 'Offboarding', icon: '📦', cmd: 'employee offboarding' },
                    { label: 'Performance', icon: '📊', cmd: 'performance review' },
                    { label: 'Expense', icon: '💰', cmd: 'expense approval' },
                    { label: 'Transfer', icon: '🔄', cmd: 'employee transfer' },
                  ].map((t, i) => (
                    <button
                      key={i}
                      className="chat-template-chip"
                      onClick={() => {
                        setIsProcessing(true);
                        addMessage({ role: 'user', content: t.cmd });
                        setTimeout(() => {
                          processCommand(t.cmd);
                          setIsProcessing(false);
                        }, 500);
                      }}
                    >
                      <span className="chat-template-icon">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              {msg.role === 'user' ? (
                <div className="chat-msg-user">
                  <ArrowRight size={11} className="chat-msg-icon" />
                  <span>{msg.content}</span>
                </div>
              ) : (
                <div className={`chat-msg-system chat-msg-system--${msg.status}`}>
                  <div className="chat-msg-system-header">
                    {msg.status === 'success' && <CheckCircle2 size={13} />}
                    {msg.status === 'error' && <AlertCircle size={13} />}
                    {msg.status === 'info' && <Sparkles size={13} />}
                    <span
                      className="chat-msg-text"
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                      }}
                    />
                  </div>

                  {/* Details */}
                  {msg.details && (
                    <div className="chat-msg-details">
                      {msg.details.baseWorkflow && (
                        <div className="chat-detail-row">
                          <span className="chat-detail-label">Workflow</span>
                          <span className="chat-detail-value">{msg.details.baseWorkflow}</span>
                        </div>
                      )}
                      {msg.details.modifiers && msg.details.modifiers.length > 0 && (
                        <div className="chat-detail-row">
                          <span className="chat-detail-label">Modifiers</span>
                          <div className="chat-detail-tags">
                            {msg.details.modifiers.map((mod, i) => (
                              <span key={i} className="chat-detail-tag">{mod}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.details.nodeCount !== undefined && (
                        <div className="chat-detail-row">
                          <span className="chat-detail-label">Result</span>
                          <span className="chat-detail-value">
                            <span className="chat-detail-count">{msg.details.nodeCount}</span> nodes ·{' '}
                            <span className="chat-detail-count">{msg.details.edgeCount}</span> edges
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="chat-suggestions">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s.id}
                          className="chat-suggestion-btn"
                          onClick={() => handleSuggestionClick(s)}
                          disabled={isProcessing}
                        >
                          <span className="chat-suggestion-icon">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="chat-message chat-message--system">
              <div className="chat-processing">
                <div className="chat-processing-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>Building workflow...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          {/* Autocomplete dropdown */}
          {showAutocomplete && (
            <div className="chat-autocomplete">
              {autocomplete.map((item, i) => (
                <button
                  key={i}
                  className="chat-autocomplete-item"
                  onClick={() => handleAutocompleteSelect(item)}
                >
                  <span className={`chat-ac-badge chat-ac-badge--${item.category}`}>
                    {item.category === 'workflow' ? '📋' : '⚙️'}
                  </span>
                  <div className="chat-ac-info">
                    <span className="chat-ac-text">{item.text}</span>
                    <span className="chat-ac-desc">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.length >= 2 && setShowAutocomplete(autocomplete.length > 0)}
              placeholder={exampleCommands[placeholderIdx]}
              disabled={isProcessing}
              id="chat-command-input"
            />
            <button
              className="chat-send-btn"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isProcessing}
              title="Send command"
            >
              <Send size={15} />
            </button>
          </div>

          <div className="chat-input-footer">
            <Box size={10} />
            <span><strong>{existingNodes.length}</strong> nodes on canvas</span>
          </div>
        </div>
      </div>

      {/* Backdrop overlay when chat is open */}
      {isOpen && <div className="chat-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default WorkflowChat;
