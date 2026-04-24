
import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validation = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(validation).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('ai_doctor_users') || '[]');
    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        onLogin(userWithoutPassword);
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (!isPasswordValid) {
        setError('Password insecure');
        return;
      }
      if (users.find((u: any) => u.email === email)) {
        setError('Email exists');
        return;
      }
      const newUser = { id: Date.now().toString(), name, email, password };
      users.push(newUser);
      localStorage.setItem('ai_doctor_users', JSON.stringify(users));
      const { password: _, ...userWithoutPassword } = newUser;
      onLogin(userWithoutPassword);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setShowPassword(false);
  };

  const Requirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${met ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}>
        {met && (
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="font-medium tracking-tight">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/10 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Doctor Companion</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium uppercase tracking-widest">Health Guidance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            {isLogin ? 'Sign In' : 'Join Now'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-2.5 rounded-lg text-[11px] font-bold border border-red-100 dark:border-red-900/40 flex items-center gap-2 uppercase tracking-wide">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 pl-1">Name</label>
                <input type="text" value={name} required onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-white" placeholder="John Doe" />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 pl-1">Email</label>
              <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-white" placeholder="email@address.com" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 pl-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} required onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-[13px] pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-white" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}</svg>
                </button>
              </div>
              {!isLogin && (
                <div className="mt-2.5 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Requirement met={validation.minLength} label="Min 8 chars" />
                  <Requirement met={validation.hasLetter} label="One letter" />
                  <Requirement met={validation.hasNumber} label="One number" />
                  <Requirement met={validation.hasSymbol} label="One symbol" />
                </div>
              )}
            </div>

            <button type="submit" disabled={!isLogin && !isPasswordValid} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-[13px] font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] mt-1 tracking-tight">
              {isLogin ? 'Sign In' : 'Get Started'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <button onClick={toggleAuthMode} className="text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-widest hover:underline">
              {isLogin ? 'Create Account' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
