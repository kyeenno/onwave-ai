'use client';

import { useStore } from './store';
import Header from './components/Header';
import Quiz from './components/Quiz';
import Chat from './components/Chat';
import { useEffect, useState } from 'react';

export default function Home() {
  const { quizCompleted } = useStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Add a smooth transition effect when quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quizCompleted]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {!quizCompleted ? (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center mb-2">
                Find the Perfect AI Tools for Your Startup
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Answer a few questions to help us recommend AI solutions tailored to your startup&apos;s stage and needs
              </p>
              
              <Quiz />
            </div>
          ) : (
            <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <Chat />
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} OnWave AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
