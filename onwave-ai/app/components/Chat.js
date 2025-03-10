import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { FiSend, FiRefreshCw } from 'react-icons/fi';
import { getHuggingFaceResponse } from '../utils/ai';

// Mock AI responses based on quiz answers
const getMockResponse = (message, quizResponses) => {
  const { businessSize, industry, aiExperience } = quizResponses;
  
  // Simple response based on industry
  const industryTools = {
    retail: ['Inventory AI', 'Customer Behavior Analytics', 'Pricing Optimization AI'],
    healthcare: ['Medical Image Analysis', 'Patient Data Management', 'Healthcare Chatbots'],
    finance: ['Fraud Detection AI', 'Algorithmic Trading', 'Risk Assessment Tools'],
    technology: ['Code Completion Tools', 'DevOps AI', 'Testing Automation'],
    education: ['Learning Management AI', 'Student Performance Analytics', 'Content Generation'],
    manufacturing: ['Predictive Maintenance', 'Supply Chain Optimization', 'Quality Control AI'],
    other: ['Project Management AI', 'Document Processing', 'Meeting Assistants'],
  };
  
  // Experience level affects the complexity of the response
  const complexityLevel = {
    none: 'beginner-friendly',
    beginner: 'easy-to-use',
    intermediate: 'powerful',
    advanced: 'sophisticated',
  };
  
  // Business size affects the scale of solutions
  const scaleDescription = {
    small: 'cost-effective',
    medium: 'scalable',
    large: 'enterprise-grade',
  };
  
  // Check if the message contains keywords about specific AI tools or categories
  if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest')) {
    const tools = industryTools[industry] || industryTools.other;
    return `Based on your ${scaleDescription[businessSize]} ${industry} business and ${aiExperience} experience level, I recommend these ${complexityLevel[aiExperience]} AI tools: ${tools.join(', ')}. Would you like more details about any of these?`;
  }
  
  // If asking about specific tools
  for (const ind in industryTools) {
    for (const tool of industryTools[ind]) {
      if (message.toLowerCase().includes(tool.toLowerCase())) {
        return `${tool} is a ${complexityLevel[aiExperience]} solution designed for ${industry === ind ? 'your industry' : ind} businesses. It's particularly ${scaleDescription[businessSize]} for your business size. Would you like to know more about implementation or pricing?`;
      }
    }
  }
  
  // Default response
  return `As a ${complexityLevel[aiExperience]} AI assistant for ${scaleDescription[businessSize]} ${industry} businesses, I can help you find the right AI tools. What specific task or challenge are you looking to address with AI?`;
};

const getResponse = async (message, responses) => {
  const {
    fundingStage,
    teamSize,
    industry,
    startupStage,
    currentChallenges,
    growthMetrics,
    timeConsumingTasks,
    techStack,
    devResources,
    currentTools,
    dataAvailability,
    aiExperience,
    aiInvestmentReadiness,
    implementationTimeframe,
    aiPriorities,
    aiCapabilities,
    successMetrics,
    concernsBarriers,
  } = responses;

  const prompt = `
    You are an AI assistant for OnWave AI, a platform that helps businesses find the right AI tools.
    
    DETAILED STARTUP PROFILE:
    - Funding stage: ${fundingStage}
    - Team size: ${teamSize}
    - Industry vertical: ${industry}
    - Product stage: ${startupStage}
    - Current challenges: ${currentChallenges.join(', ')}
    - Key growth metrics: ${growthMetrics.join(', ')}
    - Time-consuming tasks: ${timeConsumingTasks.join(', ')}
    - Tech stack maturity: ${techStack}
    - Development resources: ${devResources}
    - Current tools: ${currentTools.join(', ')}
    - Available data: ${dataAvailability.join(', ')}
    - AI experience: ${aiExperience}
    - AI budget: ${aiInvestmentReadiness}
    - Implementation timeframe: ${implementationTimeframe}
    - AI priority areas: ${aiPriorities.join(', ')}
    - Desired AI capabilities: ${aiCapabilities.join(', ')}
    - Success metrics: ${successMetrics.join(', ')}
    - Concerns/barriers: ${concernsBarriers.join(', ')}

    Based on this startup profile, provide specific, actionable advice on:
    1. WHERE in their startup they should implement AI (specific functions, processes, or product features);
    2. WHAT specific AI tools or solutions would be most beneficial given their stage, resources, and goals;
    3. HOW they should approach implementation considering their technical capabilities and funding stage.
    
    User message: ${message}
    
    Be specific, practical, and tailored to their unique situation as a startup.
    Focus on high-impact, cost-effective solutions that align with their growth stage and priorities.
    Recommend actual AI tools by name when possible. [/INST]</s>
  `;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch response from AI\n STATUS ${response.status}`);
    }

    const result = await response.json();

    if (result && result.generated_text) {
      return result.generated_text.replace(prompt, "").trim();
    } else if (Array.isArray(result) && result[0] && result[0].generated_text) {
      return result[0].generated_text.replace(prompt, "").trim();
    } else {
      console.warn('Could not parse API response:', result);
      return getMockResponse(message, responses);
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return getMockResponse(message, responses);
  }
};

export default function Chat() {
  const [inputMessage, setInputMessage] = useState('');
  const { quizResponses, chatHistory, addChatMessage, resetChat, initialResponseGenerated } = useStore();
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState("Thinking...");
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // No need to add initial greeting - it's now handled by the quiz completion
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage
    };
    addChatMessage(userMessage);
    setInputMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get AI response using the shared utility
      const responseContent = await getHuggingFaceResponse(inputMessage, quizResponses);
      
      // Add AI response to chat
      const aiResponse = {
        role: 'assistant',
        content: responseContent
      };
      addChatMessage(aiResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Fallback to mock response
      const fallbackResponse = {
        role: 'assistant',
        content: getMockResponse(inputMessage, quizResponses)
      };
      addChatMessage(fallbackResponse);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">OnWave AI Assistant</h2>
        <button 
          onClick={resetChat}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
        >
          <FiRefreshCw size={14} />
          Reset Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
        {chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="text-left mb-4">
            <div className="inline-block max-w-[80%] p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">{isLoading}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about AI tools for your business..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />
        <button 
          type="submit"
          className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          disabled={!inputMessage.trim()}
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
} 