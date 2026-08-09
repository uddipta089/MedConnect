import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { MessageSquare, X, Send, Bot, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your MedConnect AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  }, [recognition]);

  const toggleListening = () => {
    if (!recognition) return toast.error('Voice input not supported in this browser');
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userText, isBot: false }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userText });
      setMessages(prev => [...prev, { id: Date.now(), text: res.data.data.response, isBot: true }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Sorry, I am having trouble connecting right now.";
      setMessages(prev => [...prev, { id: Date.now(), text: errorMsg, isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <span className="font-bold">Health Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.isBot ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                  {msg.isBot ? (
                    <ReactMarkdown 
                      components={{
                        strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-3 mb-2 text-blue-700" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-blue-700" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1 text-blue-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-3 border-slate-200" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your symptoms..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="font-semibold hidden sm:inline">Ask AI</span>
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
