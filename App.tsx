import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { DisclaimerModal } from './components/DisclaimerModal';

const App: React.FC = () => {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage so users don't see it every refresh if they accepted recently
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (accepted === 'true') {
      setHasAcceptedDisclaimer(true);
    }

    // Check system preference or saved theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setHasAcceptedDisclaimer(true);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {!hasAcceptedDisclaimer && (
        <DisclaimerModal onAccept={handleDisclaimerAccept} />
      )}
      
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-1 pt-16 h-full max-w-5xl mx-auto w-full shadow-2xl bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 transition-colors">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;