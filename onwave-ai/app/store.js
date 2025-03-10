import { create } from 'zustand';

export const useStore = create((set) => ({
  // Quiz state
  quizCompleted: false,
  quizResponses: {
    // Startup Basics
    fundingStage: '',
    teamSize: '',
    industry: '',
    startupStage: '',
    
    // Growth Challenges & Priorities
    currentChallenges: [],
    growthMetrics: [],
    timeConsumingTasks: [],
    
    // Technical Stack & Data
    techStack: '',
    devResources: '',
    currentTools: [],
    dataAvailability: [],
    
    // AI Readiness & Resources
    aiExperience: '',
    aiInvestmentReadiness: '',
    implementationTimeframe: '',
    
    // AI Implementation Goals
    aiPriorities: [],
    aiCapabilities: [],
    successMetrics: [],
    concernsBarriers: [],
  },
  
  // Chat state
  chatHistory: [],
  initialResponseGenerated: false,
  
  // Actions
  setQuizResponse: (question, answer) => 
    set((state) => ({
      quizResponses: {
        ...state.quizResponses,
        [question]: answer,
      }
    })),
  
  completeQuiz: () => set({ quizCompleted: true }),
  
  addChatMessage: (message) => 
    set((state) => ({
      chatHistory: [...state.chatHistory, message]
    })),
  
  setInitialResponseGenerated: () => set({ initialResponseGenerated: true }),
  
  resetChat: () => set({ chatHistory: [], initialResponseGenerated: false }),
  
  resetQuiz: () => set({ 
    quizCompleted: false, 
    initialResponseGenerated: false,
    quizResponses: {
      // Reset all quiz responses to default values
      fundingStage: '',
      teamSize: '',
      industry: '',
      startupStage: '',
      currentChallenges: [],
      growthMetrics: [],
      timeConsumingTasks: [],
      techStack: '',
      devResources: '',
      currentTools: [],
      dataAvailability: [],
      aiExperience: '',
      aiInvestmentReadiness: '',
      implementationTimeframe: '',
      aiPriorities: [],
      aiCapabilities: [],
      successMetrics: [],
      concernsBarriers: [],
    }
  }),
})); 