import React from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Safety First
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            Welcome to the AI Doctor Companion. Before we begin, you must understand:
          </p>
          <ul className="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-300 text-sm">
            <li><strong>This is NOT a doctor.</strong> We do not provide medical diagnoses.</li>
            <li><strong>Informational Only.</strong> All guidance is for educational purposes.</li>
            <li><strong>No Prescriptions.</strong> We cannot prescribe medication.</li>
            <li><strong>Emergency Protocol.</strong> If you believe you are having a medical emergency, call 911 immediately.</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              By clicking "I Understand", you acknowledge that this tool suggests specialists and explains symptoms but does not replace professional medical advice.
            </p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};