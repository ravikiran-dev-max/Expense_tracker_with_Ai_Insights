import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, X, Send, Sparkles } from 'lucide-react';

// Suggested quick questions to load on initial session boot
const SUGGESTED_PROMPTS = [
  'What is my balance?',
  'How much did I spend this month?',
  'Am I close to my budget limit?',
  'Give me some saving tips',
];

/**
 * ChatBot Component: Floating AI Assistant overlay widget.
 * Enables chat dialogue about expenses using backend chatbot routes.
 */
const ChatBot = () => {
  const { user, apiCall } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Controls overlay window open/closed status
  
  // Array storing dialog message history objects
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hi ${user?.username || 'there'}! I am SpendWise AI, your personal financial assistant. You can ask me questions about your transactions, spending categories, remaining budget limits, or for general advice!`,
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState(''); // Text input element buffer
  const [loading, setLoading] = useState(false);      // Loading indicator for pending API reply
  const chatEndRef = useRef(null);                   // DOM reference to force scroll-to-bottom

  // Automatically scroll viewport to newest message on message array modifications
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Hide completely if user is unauthenticated
  if (!user) return null;

  /**
   * Action: Handles submission of a message block to the chat thread
   */
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Append user message object to thread immediately
    const userMsgId = Date.now().toString();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // POST message text to backend chatbot AI endpoint
      const response = await apiCall('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });

      // Append bot response object
      const botMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: response.reply,
          time: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Chat Assistant Error:', error);
      // Append fallback connection error message
      const errMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: errMsgId,
          sender: 'bot',
          text: `Oops, I ran into an error connecting to my analysis brain: "${error.message}". Please try again.`,
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action: Submits standard chat form
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating circle toggle icon (Hidden when chatbot window is active) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.55)] hover:scale-110 active:scale-95 transition-all duration-300 border border-indigo-400/20 animate-bounce-subtle"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Floating Chat Window Panel */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[500px] flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.15)] animate-slide-up overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  SpendWise Assistant
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-[9px] text-emerald-400 font-medium tracking-wide">Online & Analyzing</p>
                </div>
              </div>
            </div>
            
            {/* Close Panel Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-850 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/10 to-indigo-950/5">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed transition-all duration-200 ${
                      isBot
                        ? 'bg-slate-900/60 border border-slate-800/80 text-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.15)]'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.2)]'
                    }`}
                  >
                    {msg.text}
                    {/* Timestamp element */}
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isBot ? 'text-slate-500' : 'text-indigo-200/80'
                      }`}
                    >
                      {new Date(msg.time).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Pulsating dots showing chatbot is typing */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions (Displayed only at start of chat session) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-3 border-t border-slate-900/60 bg-slate-950/10">
              <span className="text-[10px] text-slate-500 font-semibold block mb-1.5">Try asking:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 font-medium hover:scale-[1.02] text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input Footer Bar */}
          <form onSubmit={handleFormSubmit} className="border-t border-slate-800/80 p-3.5 flex gap-2 bg-slate-950/95">
            <input
              type="text"
              placeholder="Ask a question about your spending..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-violet-600"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default ChatBot;
