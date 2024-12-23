import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  return (
    <div 
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-xl">
        <Loader2 
          className="w-8 h-8 text-indigo-600 animate-spin" 
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}