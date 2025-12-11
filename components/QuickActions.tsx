import React from 'react';
import { QuickAction } from '../types';

interface QuickActionsProps {
  onActionSelect: (prompt: string) => void;
  disabled?: boolean;
}

const ACTIONS: QuickAction[] = [
  {
    id: 'symptom',
    label: 'Check Symptoms',
    prompt: "I have some symptoms I'd like to understand. Can you help me figure out what might be going on and which specialist I should see?",
    icon: '🩺'
  },
  {
    id: 'doctor',
    label: 'Find a Doctor',
    prompt: "I need to find a doctor or urgent care near me. Can you help me locate one?",
    icon: '📍'
  },
  {
    id: 'firstaid',
    label: 'First Aid Guide',
    prompt: "I need instructions for first aid. Can you list common scenarios or guide me through a specific one?",
    icon: '🩹'
  },
  {
    id: 'redflags',
    label: 'When to see Doctor',
    prompt: "What are the general 'red flag' symptoms that mean I should see a doctor immediately?",
    icon: '🚩'
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionSelect(action.prompt)}
          disabled={disabled}
          className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center h-24"
        >
          <span className="text-2xl mb-2">{action.icon}</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
        </button>
      ))}
    </div>
  );
};