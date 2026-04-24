
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { GroundingChips } from './GroundingChips';
import { QuickActions } from './QuickActions';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        (err) => console.log("Location access denied/unavailable", err)
      );
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
      setTimeout(() => textareaRef.current?.focus(), 100);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size too large.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedImage) || isLoading) return;
    if (isListening) recognitionRef.current?.stop();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.filter(m => !m.isError).map(m => ({
          role: m.role,
          content: m.content,
          image: m.image
      }));
      const response = await sendMessageToGemini(history as any, text, location, currentImage || undefined);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: new Date(),
        groundingMetadata: response.groundingMetadata
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error.message || "An unexpected error occurred.",
        timestamp: new Date(),
        isError: true
      }]);
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5 pb-32 scrollbar-hide">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isLast = idx === messages.length - 1;
          
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? 'animate-message-in' : ''}`}
            >
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`relative px-4 py-2.5 shadow-sm transition-all duration-300 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900/40 rounded-2xl rounded-tl-none'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-none'
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2">
                      <img src={msg.image} alt="Symptom" className="rounded-xl max-h-48 object-cover border border-black/5 shadow-sm" />
                    </div>
                  )}
                  <div className={`prose prose-sm ${isUser ? 'prose-invert' : 'dark:prose-invert'} max-w-none text-[13px] leading-relaxed whitespace-pre-wrap`}>
                    {msg.content}
                  </div>
                  {msg.groundingMetadata?.groundingChunks && (
                    <GroundingChips chunks={msg.groundingMetadata.groundingChunks} />
                  )}
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <div className="flex space-x-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-0.5" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 z-10">
        <QuickActions onActionSelect={handleSend} disabled={isLoading} />
        
        {selectedImage && (
          <div className="px-4 pt-2 flex items-center animate-fade-in">
            <div className="relative">
              <img src={selectedImage} alt="Preview" className="h-14 w-14 object-cover rounded-xl border-2 border-blue-500/20 shadow-md" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 active:scale-90 transition-all">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="p-3.5 max-w-4xl mx-auto flex gap-2.5 items-end">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all mb-0.5 active:scale-95" disabled={isLoading}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "How can I help?"}
              className={`w-full bg-slate-50 dark:bg-slate-800/50 border text-[13px] rounded-2xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none shadow-inner placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed ${isListening ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'}`}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button onClick={toggleListening} className={`absolute right-3 bottom-2.5 p-1.5 rounded-full transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-400 hover:text-slate-600'}`} disabled={isLoading}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
          </div>
          <button onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white p-2.5 rounded-xl transition-all flex-shrink-0 shadow-lg shadow-blue-600/20 active:scale-95">
            <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <div className="text-center pb-1.5">
           <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight">Non-diagnostic advice. Use with caution.</p>
        </div>
      </div>
    </div>
  );
};
