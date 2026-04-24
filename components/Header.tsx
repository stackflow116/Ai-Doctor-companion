
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, user, onLogout }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 sm:px-5 fixed top-0 w-full z-10 transition-colors duration-200">
      <div className="flex items-center gap-2.5">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-600/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-md font-bold text-slate-800 dark:text-white leading-none">AI Doctor Companion</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Safe Health Guidance</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
          </div>
        )}

        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
