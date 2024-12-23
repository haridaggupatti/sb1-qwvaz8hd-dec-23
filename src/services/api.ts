import OpenAI from 'openai';
import { delay } from '../utils/helpers';
import { analyzeResume } from '../utils/resume-analyzer';
import { generateInterviewPrompt } from '../utils/prompt-generator';
import { PersonalityEngine } from '../utils/personality-engine';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Memory store for conversations
interface ConversationMemory {
  messages: any[];
  context: string;
  lastActive: number;
  personalityEngine?: PersonalityEngine;
}

const conversationMemory: Record<string, ConversationMemory> = {};

export const interviewApi = {
  uploadResume: async (content: string) => {
    await delay(1000);
    const sessionId = `session_${Date.now()}`;
    
    // Analyze resume and create personality engine
    const personalityEngine = new PersonalityEngine(content);
    const resumeAnalysis = analyzeResume(content);
    const prompt = generateInterviewPrompt(resumeAnalysis);
    
    conversationMemory[sessionId] = {
      messages: [],
      context: content,
      lastActive: Date.now(),
      personalityEngine
    };
    
    localStorage.setItem(`resume_${sessionId}`, content);
    
    return {
      session_id: sessionId,
      status: 'success',
      analysis: resumeAnalysis
    };
  },

  getAnswer: async (question: string, sessionId: string) => {
    await delay(1500);
    
    const memory = conversationMemory[sessionId];
    if (!memory) {
      throw new Error('Session not found or expired');
    }

    try {
      const personalityContext = memory.personalityEngine?.generatePromptContext() || '';
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `I'm the recruiter asking questions to assess your skills and expertise. Based on this resume:\n\n${memory.context}\n\n${personalityContext}\n\nRespond to any technical or non-technical question in normal Indian slang English in a concise manner, and conversational manner, as if we're speaking face-to-face, showcasing your achievements, skills, and problem-solving abilities based on question. Respond without using any large and complicated vocabulary, complicated words and complicated terminologies in the speech, and give the answer short and concise without dramatic words. Don't give any answer like a text book answer, if possible give with real world example. Answer my questions as you are a human, maintaining the persona of the actual candidate.`
          },
          ...memory.messages,
          { role: "user", content: question }
        ],
        temperature: 0.9,
        max_tokens: 500,
        presence_penalty: 0.7,
        frequency_penalty: 0.5
      });

      const response = completion.choices[0]?.message?.content || 
        'I apologize, but I am unable to process your request at the moment.';
      
      memory.messages.push(
        { role: "user", content: question },
        { role: "assistant", content: response }
      );
      memory.lastActive = Date.now();

      return {
        response,
        status: 'success'
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(error.message);
    }
  },

  clearConversation: (sessionId: string) => {
    delete conversationMemory[sessionId];
  }
};

export { authApi } from './auth';
export { userApi } from './user';
export { adminApi } from './admin';