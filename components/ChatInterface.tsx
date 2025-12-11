import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { GroundingChips } from './GroundingChips';
import { QuickActions } from './QuickActions';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello. I am the AI Doctor Companion. I can help explain symptoms, suggest specialists, guide you through first aid, or find local medical resources.\n\n**I am not a doctor.** How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Request location on mount for better local grounding
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        (err) => console.log("Location access denied/unavailable", err)
      );
    }
  }, []);

  const scrollToBottom = () => {
    // Small timeout ensures content is rendered before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  // Scroll on messages change AND loading state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => {
        const newValue = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript;
        return newValue;
      });
      // Focus back on textarea after speaking
      setTimeout(() => textareaRef.current?.focus(), 100);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    // Stop listening if sending
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => !m.isError).map(m => ({
          ...m,
          role: m.role,
          content: m.content
      })); // sanitize history, remove errors

      const response = await sendMessageToGemini(history, text, location);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: new Date(),
        groundingMetadata: response.groundingMetadata
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error.message || "An unexpected error occurred.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-200">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-36 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm transition-colors ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-800 rounded-bl-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'prose-slate dark:prose-invert'} max-w-none text-sm leading-relaxed whitespace-pre-wrap`}>
                {msg.content}
              </div>

              {/* Retry Button for Errors */}
              {msg.isError && (
                <button 
                  onClick={() => setInput(messages[messages.indexOf(msg) - 1]?.content || '')}
                  className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              )}

              {/* Display Map Chips if Grounding Metadata exists */}
              {msg.groundingMetadata?.groundingChunks && (
                <GroundingChips chunks={msg.groundingMetadata.groundingChunks} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 transition-colors duration-200">
        <QuickActions onActionSelect={handleSend} disabled={isLoading} />
        <div className="p-4 max-w-4xl mx-auto flex gap-3 items-end">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Describe your symptoms, ask about a condition, or find a doctor..."}
              className={`w-full bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none shadow-sm placeholder-slate-400 dark:placeholder-slate-500 ${
                isListening 
                  ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30 bg-red-50/10 dark:bg-red-900/10' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
              }`}
              rows={1}
              style={{ minHeight: '52px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse ring-2 ring-red-200 dark:ring-red-800' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Voice Input"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isListening ? (
                     // Stop/Wave icon
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                     // Mic icon
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-3 rounded-xl transition-all shadow-md flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="text-center pb-2 bg-white dark:bg-slate-900 transition-colors">
           <p className="text-[10px] text-slate-400 dark:text-slate-500">AI can make mistakes. Always consult a real doctor for medical decisions.</p>
        </div>
      </div>
    </div>
  );
};