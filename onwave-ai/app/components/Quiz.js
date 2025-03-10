import { useState } from 'react';
import { useStore } from '../store';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { getHuggingFaceResponse } from '../utils/ai';

// Startup-focused quiz questions
const quizSections = [
  {
    title: "Startup Basics",
    questions: [
      {
        id: 'fundingStage',
        question: 'What is your startup\'s current funding stage?',
        options: [
          { value: 'bootstrapped', label: 'Bootstrapped / Self-funded' },
          { value: 'pre-seed', label: 'Pre-seed' },
          { value: 'seed', label: 'Seed' },
          { value: 'seriesA', label: 'Series A' },
          { value: 'seriesB', label: 'Series B or C' },
          { value: 'seriesD', label: 'Series D+' },
          { value: 'profitable', label: 'Profitable / No external funding' },
        ],
      },
      {
        id: 'teamSize',
        question: 'How large is your team?',
        options: [
          { value: 'solo', label: 'Solo founder' },
          { value: 'micro', label: 'Micro team (2-5 people)' },
          { value: 'small', label: 'Small team (6-15 people)' },
          { value: 'medium', label: 'Medium team (16-50 people)' },
          { value: 'large', label: 'Large team (50+ people)' },
        ],
      },
      {
        id: 'industry',
        question: 'What industry vertical is your startup in?',
        options: [
          { value: 'fintech', label: 'Fintech' },
          { value: 'healthtech', label: 'Healthtech / Medtech' },
          { value: 'ecommerce', label: 'E-commerce / D2C' },
          { value: 'saas', label: 'SaaS / Enterprise Software' },
          { value: 'marketplace', label: 'Marketplace / Platform' },
          { value: 'ai', label: 'AI / ML' },
          { value: 'hardware', label: 'Hardware / IoT' },
          { value: 'consumer', label: 'Consumer Apps' },
          { value: 'edtech', label: 'Edtech' },
          { value: 'cleantech', label: 'Cleantech / Sustainability' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'startupStage',
        question: 'What stage is your product in?',
        options: [
          { value: 'ideation', label: 'Ideation / Concept' },
          { value: 'mvp', label: 'MVP / Prototype' },
          { value: 'earlyTraction', label: 'Early Traction (some users/revenue)' },
          { value: 'productMarketFit', label: 'Product-Market Fit' },
          { value: 'scaling', label: 'Scaling / Growth' },
        ],
      },
    ]
  },
  {
    title: "Growth Challenges & Priorities",
    questions: [
      {
        id: 'currentChallenges',
        question: 'What are your biggest challenges right now? (Select up to 3)',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'userAcquisition', label: 'User acquisition / Growth' },
          { value: 'productDevelopment', label: 'Product development / Iteration' },
          { value: 'fundraising', label: 'Fundraising / Investor relations' },
          { value: 'hiring', label: 'Hiring / Team building' },
          { value: 'operations', label: 'Operations / Scaling processes' },
          { value: 'customerRetention', label: 'Customer retention / Engagement' },
          { value: 'unitEconomics', label: 'Unit economics / Profitability' },
          { value: 'goToMarket', label: 'Go-to-market strategy' },
          { value: 'competition', label: 'Competition / Market positioning' },
          { value: 'regulation', label: 'Regulatory / Compliance issues' },
        ],
      },
      {
        id: 'growthMetrics',
        question: 'Which metrics are most important for your startup right now? (Select up to 3)',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'userGrowth', label: 'User/customer growth' },
          { value: 'revenue', label: 'Revenue growth' },
          { value: 'engagement', label: 'User engagement / Retention' },
          { value: 'conversion', label: 'Conversion rates' },
          { value: 'cac', label: 'Customer acquisition cost (CAC)' },
          { value: 'ltv', label: 'Lifetime value (LTV)' },
          { value: 'runway', label: 'Runway / Burn rate' },
          { value: 'gmv', label: 'GMV / Transaction volume' },
          { value: 'nps', label: 'NPS / Customer satisfaction' },
          { value: 'productMetrics', label: 'Product usage metrics' },
        ],
      },
      {
        id: 'timeConsumingTasks',
        question: 'Which tasks consume most of your team\'s time? (Select up to 3)',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'development', label: 'Product development / Engineering' },
          { value: 'customerSupport', label: 'Customer support / Success' },
          { value: 'sales', label: 'Sales / Business development' },
          { value: 'marketing', label: 'Marketing / Growth' },
          { value: 'dataAnalysis', label: 'Data analysis / Reporting' },
          { value: 'contentCreation', label: 'Content creation' },
          { value: 'meetings', label: 'Meetings / Communication' },
          { value: 'fundraising', label: 'Fundraising / Investor relations' },
          { value: 'recruitment', label: 'Recruitment / Onboarding' },
          { value: 'administration', label: 'Administrative tasks' },
        ],
      },
    ]
  },
  {
    title: "Technical Stack & Data",
    questions: [
      {
        id: 'techStack',
        question: 'What does your current tech stack look like?',
        options: [
          { value: 'minimal', label: 'Minimal (mostly no-code tools, spreadsheets)' },
          { value: 'standard', label: 'Standard (common frameworks, some custom code)' },
          { value: 'advanced', label: 'Advanced (custom development, multiple technologies)' },
          { value: 'cutting-edge', label: 'Cutting-edge (latest technologies, microservices)' },
        ],
      },
      {
        id: 'devResources',
        question: 'What development resources do you have?',
        options: [
          { value: 'noTech', label: 'No technical co-founder or developers' },
          { value: 'techCofounder', label: 'Technical co-founder only' },
          { value: 'smallDev', label: 'Small development team (1-3 developers)' },
          { value: 'mediumDev', label: 'Medium development team (4-10 developers)' },
          { value: 'largeDev', label: 'Large development team (10+ developers)' },
          { value: 'outsourced', label: 'Outsourced development / Agency' },
        ],
      },
      {
        id: 'currentTools',
        question: 'What tools are you currently using? (Select all that apply)',
        multiSelect: true,
        options: [
          { value: 'analytics', label: 'Analytics (Google Analytics, Mixpanel, etc.)' },
          { value: 'crm', label: 'CRM (Hubspot, Salesforce, etc.)' },
          { value: 'marketing', label: 'Marketing automation (Mailchimp, etc.)' },
          { value: 'productManagement', label: 'Product management (Jira, Asana, etc.)' },
          { value: 'communication', label: 'Team communication (Slack, Discord, etc.)' },
          { value: 'design', label: 'Design tools (Figma, Sketch, etc.)' },
          { value: 'customerSupport', label: 'Customer support (Intercom, Zendesk, etc.)' },
          { value: 'devOps', label: 'DevOps tools (GitHub, GitLab, etc.)' },
          { value: 'noCode', label: 'No-code tools (Webflow, Bubble, etc.)' },
          { value: 'aiTools', label: 'AI tools (already using some)' },
          { value: 'minimal', label: 'Minimal tooling' },
        ],
      },
      {
        id: 'dataAvailability',
        question: 'What type of data do you currently collect?',
        multiSelect: true,
        options: [
          { value: 'userBehavior', label: 'User behavior / Product usage data' },
          { value: 'customerData', label: 'Customer profiles / Demographics' },
          { value: 'transactionData', label: 'Transaction / Payment data' },
          { value: 'marketingData', label: 'Marketing / Acquisition data' },
          { value: 'feedbackData', label: 'Customer feedback / Support data' },
          { value: 'operationalData', label: 'Operational / Process data' },
          { value: 'contentData', label: 'Content / Media data' },
          { value: 'minimalData', label: 'We collect minimal data currently' },
        ],
      },
    ]
  },
  {
    title: "AI Readiness & Resources",
    questions: [
      {
        id: 'aiExperience',
        question: 'What is your team\'s experience with AI tools?',
        options: [
          { value: 'none', label: 'No experience (never used AI tools)' },
          { value: 'basic', label: 'Basic (used consumer AI like ChatGPT)' },
          { value: 'intermediate', label: 'Intermediate (implemented basic AI in product/operations)' },
          { value: 'advanced', label: 'Advanced (AI expertise on team, multiple implementations)' },
          { value: 'core', label: 'Core competency (AI is central to our product)' },
        ],
      },
      {
        id: 'aiInvestmentReadiness',
        question: 'What is your monthly budget for AI tools/implementation?',
        options: [
          { value: 'minimal', label: 'Minimal (<$100/month)' },
          { value: 'small', label: 'Small ($100-$500/month)' },
          { value: 'medium', label: 'Medium ($500-$2,000/month)' },
          { value: 'large', label: 'Large ($2,000-$10,000/month)' },
          { value: 'enterprise', label: 'Enterprise ($10,000+/month)' },
        ],
      },
      {
        id: 'implementationTimeframe',
        question: 'What is your timeframe for implementing AI solutions?',
        options: [
          { value: 'immediate', label: 'Immediate (within 2 weeks)' },
          { value: 'shortTerm', label: 'Short-term (2-4 weeks)' },
          { value: 'mediumTerm', label: 'Medium-term (1-3 months)' },
          { value: 'longTerm', label: 'Long-term (3+ months)' },
          { value: 'exploring', label: 'Just exploring options for now' },
        ],
      },
    ]
  },
  {
    title: "AI Implementation Goals",
    questions: [
      {
        id: 'aiPriorities',
        question: 'Which areas do you want to enhance with AI? (Select up to 3)',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'productFeatures', label: 'Product features / Capabilities' },
          { value: 'customerExperience', label: 'Customer experience / Support' },
          { value: 'marketing', label: 'Marketing / User acquisition' },
          { value: 'sales', label: 'Sales / Conversion optimization' },
          { value: 'operations', label: 'Operations / Internal efficiency' },
          { value: 'dataAnalysis', label: 'Data analysis / Business intelligence' },
          { value: 'contentCreation', label: 'Content creation / Management' },
          { value: 'productDevelopment', label: 'Product development / R&D' },
          { value: 'decisionMaking', label: 'Decision making / Strategy' },
          { value: 'security', label: 'Security / Fraud prevention' },
        ],
      },
      {
        id: 'aiCapabilities',
        question: 'Which AI capabilities are you most interested in? (Select up to 3)',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'nlp', label: 'Natural language processing / Generation' },
          { value: 'imageGeneration', label: 'Image generation / Processing' },
          { value: 'dataAnalytics', label: 'Data analytics / Insights' },
          { value: 'automation', label: 'Process automation / Workflows' },
          { value: 'personalization', label: 'Personalization / Recommendations' },
          { value: 'chatbots', label: 'Chatbots / Conversational AI' },
          { value: 'prediction', label: 'Predictive analytics / Forecasting' },
          { value: 'voiceAi', label: 'Voice / Speech recognition' },
          { value: 'computerVision', label: 'Computer vision / Object detection' },
          { value: 'agentAi', label: 'Autonomous agents / Decision systems' },
        ],
      },
      {
        id: 'successMetrics',
        question: 'How would you measure the success of AI implementation?',
        multiSelect: true,
        maxSelections: 3,
        options: [
          { value: 'growthAcceleration', label: 'Growth acceleration' },
          { value: 'costReduction', label: 'Cost reduction / Efficiency' },
          { value: 'userRetention', label: 'User retention / Engagement' },
          { value: 'productQuality', label: 'Product quality / Capabilities' },
          { value: 'teamProductivity', label: 'Team productivity' },
          { value: 'decisionSpeed', label: 'Decision-making speed / Quality' },
          { value: 'competitiveAdvantage', label: 'Competitive advantage' },
          { value: 'customerSatisfaction', label: 'Customer satisfaction' },
          { value: 'investorAttraction', label: 'Investor attractiveness' },
        ],
      },
      {
        id: 'concernsBarriers',
        question: 'What concerns do you have about implementing AI? (Select all that apply)',
        multiSelect: true,
        options: [
          { value: 'cost', label: 'Cost and ROI uncertainty' },
          { value: 'technicalDebt', label: 'Technical debt / Integration challenges' },
          { value: 'expertise', label: 'Lack of expertise / Knowledge' },
          { value: 'dataQuality', label: 'Data quality / Availability' },
          { value: 'privacy', label: 'Privacy / Security concerns' },
          { value: 'reliability', label: 'Reliability / Performance issues' },
          { value: 'resources', label: 'Resource constraints (time/people)' },
          { value: 'rapidChanges', label: 'Rapidly changing AI landscape' },
          { value: 'none', label: 'No significant concerns' },
        ],
      },
    ]
  },
];

export default function Quiz() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    setQuizResponse, 
    completeQuiz, 
    quizResponses, 
    addChatMessage,
    setInitialResponseGenerated
  } = useStore();
  const [selections, setSelections] = useState({});
  
  const section = quizSections[currentSection];
  const question = section.questions[currentQuestion];
  const isMultiSelect = question.multiSelect === true;
  
  // Initialize selections for multi-select questions
  if (isMultiSelect && !selections[question.id]) {
    setSelections({...selections, [question.id]: []});
  }
  
  const handleSingleSelect = (answer) => {
    setQuizResponse(question.id, answer);
    
    moveToNextQuestion();
  };
  
  const handleMultiSelect = (answer) => {
    const currentSelections = selections[question.id] || [];
    let newSelections;
    
    if (currentSelections.includes(answer)) {
      // Remove if already selected
      newSelections = currentSelections.filter(item => item !== answer);
    } else {
      // Add if not selected and under max limit (if applicable)
      if (!question.maxSelections || currentSelections.length < question.maxSelections) {
        newSelections = [...currentSelections, answer];
      } else {
        // At max selections, replace the first one (or show a message)
        newSelections = [...currentSelections.slice(1), answer];
      }
    }
    
    setSelections({...selections, [question.id]: newSelections});
  };
  
  const submitMultiSelect = () => {
    setQuizResponse(question.id, selections[question.id]);
    moveToNextQuestion();
  };
  
  const moveToNextQuestion = () => {
    if (currentQuestion < section.questions.length - 1) {
      // Move to next question in current section
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < quizSections.length - 1) {
      // Move to first question of next section
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      // Quiz completed - generate initial response
      handleQuizCompletion();
    }
  };
  
  const moveToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Move to previous question in current section
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      // Move to last question of previous section
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(quizSections[currentSection - 1].questions.length - 1);
    }
  };
  
  // Calculate overall progress
  const totalQuestions = quizSections.reduce((total, section) => total + section.questions.length, 0);
  let completedQuestions = 0;
  for (let i = 0; i < currentSection; i++) {
    completedQuestions += quizSections[i].questions.length;
  }
  completedQuestions += currentQuestion;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;
  
  // New function to handle quiz completion and generate initial response
  const handleQuizCompletion = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate an initial welcome message
      const welcomeMessage = {
        role: 'assistant',
        content: `Thanks for completing the quiz! I'm analyzing your startup profile...`
      };
      addChatMessage(welcomeMessage);
      
      // Generate the initial AI response based on quiz data
      const initialPrompt = "Based on my startup profile, what are the top 3 areas where AI could help me, and what specific tools would you recommend?";
      
      // Add user's implied question to the chat
      const userMessage = {
        role: 'user',
        content: initialPrompt
      };
      addChatMessage(userMessage);
      
      // Get AI response
      let responseContent;
      try {
        // Try to get response from Hugging Face
        responseContent = await getHuggingFaceResponse(initialPrompt, quizResponses);
      } catch (error) {
        console.error("Error getting AI response:", error);
        // Fallback to a generic response if API fails
        responseContent = generateFallbackResponse(quizResponses);
      }
      
      // Add AI response to chat
      const aiResponse = {
        role: 'assistant',
        content: responseContent
      };
      addChatMessage(aiResponse);
      
      // Mark initial response as generated
      setInitialResponseGenerated(true);
      
      // Complete the quiz to show the chat interface
      completeQuiz();
    } catch (error) {
      console.error("Error during quiz completion:", error);
      // Complete the quiz anyway to show the chat interface
      completeQuiz();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fallback response generator function
  function generateFallbackResponse(quizResponses) {
    const { 
      fundingStage, 
      industry, 
      startupStage, 
      aiPriorities = [], 
      currentChallenges = [] 
    } = quizResponses;
    
    // Create a basic response based on available data
    return `Based on your ${fundingStage} startup in the ${industry} industry at the ${startupStage} stage, here are my initial recommendations:

1. **${aiPriorities[0] || 'Process Automation'}**: Consider tools like Zapier, Make (formerly Integromat), or n8n to automate repetitive tasks and workflows.

2. **${aiPriorities[1] || 'Customer Engagement'}**: Look into AI chatbots like Intercom or Drift to improve customer support while saving time.

3. **${currentChallenges[0] || 'Data Analysis'}**: Tools like Obviously AI or Akkio can help you leverage your data without requiring a data science team.

What specific area would you like to explore first?`;
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Section title */}
      <h2 className="text-2xl font-bold mb-2 text-center">
        {section.title}
      </h2>
      
      <p className="text-center text-gray-500 mb-6">
        Section {currentSection + 1} of {quizSections.length}
      </p>
      
      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              className={`w-full py-3 px-4 text-left rounded-lg border transition-colors flex items-center hover:bg-gray-700 cursor-pointer ${
                isMultiSelect 
                  ? selections[question.id]?.includes(option.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-primary hover:text-white hover:border-primary'
              }`}
              onClick={() => isMultiSelect 
                ? handleMultiSelect(option.value) 
                : handleSingleSelect(option.value)
              }
            >
              {isMultiSelect && (
                <div className={`w-5 h-5 mr-3 border rounded flex items-center justify-center ${
                  selections[question.id]?.includes(option.value)
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-400'
                }`}>
                  {selections[question.id]?.includes(option.value) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Multi-select continue button */}
        {isMultiSelect && (
          <button
            className={`mt-6 w-full py-3 rounded-lg ${
              selections[question.id]?.length > 0
                ? 'bg-primary text-white cursor-pointer hover:text-gray-500 transition ease-in-out duration-200'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            onClick={submitMultiSelect}
            disabled={!selections[question.id]?.length}
          >
            Continue
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={moveToPreviousQuestion}
          className={`flex items-center text-sm ${
            currentSection === 0 && currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed transition ease-in-out duration-200'
              : 'text-gray-600 hover:text-primary hover:text-gray-500 cursor-pointer'
          }`}
          disabled={currentSection === 0 && currentQuestion === 0}
        >
          <FiArrowLeft className="mr-1" />
          Previous
        </button>
        
        <div className="text-sm text-gray-500">
          Question {completedQuestions + 1} of {totalQuestions}
        </div>
      </div>
      
      {/* Show loading state during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#001500] flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Analyzing Your Startup Profile</h3>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Preparing personalized AI recommendations based on your responses...
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 