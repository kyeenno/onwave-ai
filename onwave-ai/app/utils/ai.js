// Function to get response from Hugging Face API
export async function getHuggingFaceResponse(message, quizResponses) {
    // Extract all the startup-specific quiz data
    const {
      fundingStage,
      teamSize,
      industry,
      startupStage,
      currentChallenges = [],
      growthMetrics = [],
      timeConsumingTasks = [],
      techStack,
      devResources,
      currentTools = [],
      dataAvailability = [],
      aiExperience,
      aiInvestmentReadiness,
      implementationTimeframe,
      aiPriorities = [],
      aiCapabilities = [],
      successMetrics = [],
      concernsBarriers = [],
    } = quizResponses;
    
    // Create a startup-focused prompt
    const prompt = `<s>[INST] You are an AI assistant for OnWave AI, a platform that helps startups find and implement the right AI tools to accelerate their growth and efficiency.
  
  DETAILED STARTUP PROFILE:
  - Funding stage: ${fundingStage || 'Unknown'}
  - Team size: ${teamSize || 'Unknown'}
  - Industry vertical: ${industry || 'Unknown'}
  - Product stage: ${startupStage || 'Unknown'}
  - Current challenges: ${currentChallenges.join(', ') || 'Not specified'}
  - Key growth metrics: ${growthMetrics.join(', ') || 'Not specified'}
  - Time-consuming tasks: ${timeConsumingTasks.join(', ') || 'Not specified'}
  - Tech stack maturity: ${techStack || 'Unknown'}
  - Development resources: ${devResources || 'Unknown'}
  - Current tools: ${currentTools.join(', ') || 'Not specified'}
  - Available data: ${dataAvailability.join(', ') || 'Not specified'}
  - AI experience: ${aiExperience || 'Unknown'}
  - AI budget: ${aiInvestmentReadiness || 'Unknown'}
  - Implementation timeframe: ${implementationTimeframe || 'Unknown'}
  - AI priority areas: ${aiPriorities.join(', ') || 'Not specified'}
  - Desired AI capabilities: ${aiCapabilities.join(', ') || 'Not specified'}
  - Success metrics: ${successMetrics.join(', ') || 'Not specified'}
  - Concerns/barriers: ${concernsBarriers.join(', ') || 'Not specified'}
  
  Based on this startup profile, provide specific, actionable advice on:
  1. WHERE in their startup they should implement AI (specific functions, processes, or product features)
  2. WHAT specific AI tools or solutions would be most beneficial given their stage, resources, and goals
  3. HOW they should approach implementation considering their technical capabilities and funding stage
  
  User message: ${message}
  
  Be specific, practical, and tailored to their unique situation as a startup. Focus on high-impact, cost-effective solutions that align with their growth stage and priorities. Recommend actual AI tools by name when possible. [/INST]</s>`;
  
    try {
      console.log("Sending request to Hugging Face API...");
      
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response received:", result);
      
      // Handle different response formats
      let extractedText = "";
      
      // Case 1: Standard format with generated_text property
      if (result && typeof result.generated_text === 'string') {
        extractedText = result.generated_text;
      } 
      // Case 2: Array format
      else if (Array.isArray(result) && result.length > 0) {
        if (typeof result[0] === 'string') {
          extractedText = result[0];
        } else if (result[0] && typeof result[0].generated_text === 'string') {
          extractedText = result[0].generated_text;
        }
      }
      // Case 3: Other formats with text property
      else if (result && typeof result.text === 'string') {
        extractedText = result.text;
      }
      // Case 4: Other formats with output property
      else if (result && typeof result.output === 'string') {
        extractedText = result.output;
      }
      
      // If we found text, try to extract just the response part
      if (extractedText) {
        console.log("Extracted raw text:", extractedText);
        
        // Try different extraction methods
        let cleanedText = "";
        
        // Method 1: Split by [/INST] tag
        if (extractedText.includes('[/INST]')) {
          const parts = extractedText.split('[/INST]');
          if (parts.length > 1) {
            cleanedText = parts[1].replace('</s>', '').trim();
          }
        }
        // Method 2: Remove the prompt if it's at the beginning
        else if (extractedText.startsWith(prompt)) {
          cleanedText = extractedText.substring(prompt.length).trim();
        }
        // Method 3: Just use the whole text if we can't extract
        else {
          cleanedText = extractedText;
        }
        
        console.log("Cleaned text:", cleanedText);
        return cleanedText || "I couldn't generate a proper response. Please try asking a different question.";
      }
      
      console.error("Could not extract text from API response:", result);
      return "I couldn't generate a proper response. Please try asking a different question.";
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      throw error;
    }
  }
