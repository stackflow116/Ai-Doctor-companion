
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { DisclaimerModal } from './components/DisclaimerModal';
import { Auth } from './components/Auth';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('ai_doctor_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Check disclaimer
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
    
    setIsInitializing(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ai_doctor_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ai_doctor_session');
  };

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

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth Flow
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {!hasAcceptedDisclaimer && (
        <DisclaimerModal onAccept={handleDisclaimerAccept} />
      )}
      
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 pt-14 h-full max-w-4xl mx-auto w-full shadow-xl bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 transition-colors relative overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
