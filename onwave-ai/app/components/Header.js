import { useStore } from '../store';

export default function Header() {
  const { quizCompleted, resetQuiz, resetChat } = useStore();
  
  const handleReset = () => {
    resetQuiz();
    resetChat();
  };
  
  return (
    <header className="py-4 px-6 bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
            OW
          </div>
          <h1 className="text-xl font-bold">OnWave AI</h1>
        </div>
        
        {quizCompleted && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-primary"
          >
            Restart Quiz
          </button>
        )}
      </div>
    </header>
  );
} 