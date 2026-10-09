import React, { useState, useRef, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { sendChatMessage } from '../services/api';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Accessibility,
  AlertTriangle,
  FileText,
  RotateCcw,
  Loader2
} from 'lucide-react';

export default function AIAssistantPage() {
  const { setActiveTab } = useReports();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am GuardianBot, your 24/7 AI Campus Assistant. Ask me anything about reporting campus hazards, finding lost belongings, locating accessible routes, or campus emergency contacts.',
      suggestedActions: [
        { label: 'Report Campus Issue', route: '/report' },
        { label: 'Campus Emergency Hotlines', route: '/emergency' },
        { label: 'Accessibility Hub', route: '/accessibility' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const starterQuestions = [
    'Where do I report a broken projector?',
    'What should I do if I find a lost ID card?',
    'How do I report a water leak?',
    'Where can I find accessibility assistance?',
    'What are the campus security numbers?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(query, messages);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        suggestedActions: response.suggestedActions || [],
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I can assist you with reporting issues or contacting campus security. You can file a report directly or view our emergency contacts.',
        suggestedActions: [
          { label: 'Report Issue', route: '/report' },
          { label: 'Emergency Center', route: '/emergency' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.route) {
      const tabName = action.route.replace('/', '');
      setActiveTab(tabName);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Chat history reset. How can I help you today?',
        suggestedActions: [
          { label: 'Report Campus Issue', route: '/report' },
          { label: 'Emergency Contacts', route: '/emergency' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">AI Campus Assistant</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            24/7 knowledge base for facility reporting, accessibility aid, lost items, and emergency contacts.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-800 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Conversation</span>
        </button>
      </div>

      {/* Suggested Starters Strip */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Frequently Asked Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-500/30 transition text-left"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window Container */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden flex flex-col h-[560px] shadow-2xl">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[78%] ${
                  isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow ${
                    isBot
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                      : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? 'bg-slate-900/95 text-slate-200 border border-slate-800 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm shadow-glow-blue'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isBot ? 'text-slate-500' : 'text-blue-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Contextual Action Buttons in Bot Message */}
                  {isBot && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleActionClick(act)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/40 text-indigo-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>GuardianBot is retrieving campus information...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-navy-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask GuardianBot: 'How do I report a water leak?' or 'Where is accessibility assistance?'"
              className="flex-1 px-4 py-3 text-xs sm:text-sm text-white glass-input rounded-2xl placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-glow-blue transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
