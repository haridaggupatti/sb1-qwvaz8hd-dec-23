import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const openaiService = {
  async explainCode(code: string, language: string, context?: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer explaining code to a fellow developer. Explain the code in a conversational way, as if you're sitting next to them. ${context ? 'Focus on explaining: ' + context : 'Explain the following code in detail, including its purpose, logic, and potential improvements.'}`
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.choices[0]?.message?.content || 'No explanation available';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to explain code');
    }
  },

  async generateCodeResponse(prompt: string, language: string): Promise<{ code: string; explanation: string }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Generate clear, efficient, and well-commented code based on the user's request.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : '';
      const explanation = response.replace(/```[\w]*\n[\s\S]*?```/, '').trim();

      return { code, explanation };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate code');
    }
  },

  async fixCode(code: string, language: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Fix and improve the following code. Return only the improved code without any explanation.`
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return completion.choices[0]?.message?.content || code;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to fix code');
    }
  },

  async suggestImprovements(code: string, language: string): Promise<string[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Analyze the code and suggest improvements. Return a list of specific, actionable suggestions.`
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to suggest improvements');
    }
  },

  async answerCodeQuestion(code: string, question: string, language: string): Promise<{ explanation: string; suggestedChanges?: string }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Answer the question about the code and suggest improvements if relevant.`
          },
          {
            role: "user",
            content: `Code:\n${code}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
      return {
        explanation: response.replace(/```[\w]*\n[\s\S]*?```/, '').trim(),
        suggestedChanges: codeMatch ? codeMatch[1].trim() : undefined
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to answer question');
    }
  },

  async generateTestCases(code: string, language: string): Promise<{ testCases: any[] }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Generate comprehensive test cases for the given code.`
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      // Parse test cases from response
      const testCases = JSON.parse(response);
      return { testCases };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate test cases');
    }
  }
};