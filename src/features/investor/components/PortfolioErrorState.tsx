import { AlertTriangle } from 'lucide-react';

interface PortfolioErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function PortfolioErrorState({ message, onRetry }: PortfolioErrorStateProps) {
  return (
    <div className="text-center py-16 border border-red-200 rounded-xl bg-red-50">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
      <h3 className="text-lg font-semibold text-red-700">Portfolio unavailable</h3>
      <p className="text-red-600 mt-1 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 bg-white border border-red-300 text-red-700 hover:bg-red-100 font-medium px-4 py-2 rounded-lg transition"
      >
        Try again
      </button>
    </div>
  );
}
