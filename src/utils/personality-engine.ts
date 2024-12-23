export interface PersonalityTraits {
  confidence: number;  // 0-1: How confident the responses should be
  formality: number;  // 0-1: How formal/informal the language should be
  detail: number;     // 0-1: How detailed the responses should be
  enthusiasm: number; // 0-1: Level of enthusiasm in responses
}

export interface PersonaContext {
  experience: string[];
  skills: string[];
  achievements: string[];
  education: string[];
  communicationStyle: PersonalityTraits;
}

export class PersonalityEngine {
  private context: PersonaContext;
  
  constructor(resumeText: string) {
    this.context = this.analyzeResume(resumeText);
  }

  private analyzeResume(resumeText: string): PersonaContext {
    // Extract key information from resume
    const experience = this.extractExperience(resumeText);
    const skills = this.extractSkills(resumeText);
    const achievements = this.extractAchievements(resumeText);
    const education = this.extractEducation(resumeText);
    
    // Determine communication style based on resume content
    const communicationStyle = this.determinePersonality(resumeText);

    return {
      experience,
      skills,
      achievements,
      education,
      communicationStyle
    };
  }

  private extractExperience(text: string): string[] {
    const experienceMarkers = [
      'experience', 'worked', 'position', 'role',
      'job', 'employment', 'career'
    ];
    return this.extractSection(text, experienceMarkers);
  }

  private extractSkills(text: string): string[] {
    const skillMarkers = [
      'skills', 'technologies', 'proficient',
      'expertise', 'competencies', 'tools'
    ];
    return this.extractSection(text, skillMarkers);
  }

  private extractAchievements(text: string): string[] {
    const achievementMarkers = [
      'achieved', 'accomplished', 'improved',
      'developed', 'created', 'led', 'managed'
    ];
    return this.extractSection(text, achievementMarkers);
  }

  private extractEducation(text: string): string[] {
    const educationMarkers = [
      'education', 'degree', 'university',
      'college', 'certification', 'diploma'
    ];
    return this.extractSection(text, educationMarkers);
  }

  private extractSection(text: string, markers: string[]): string[] {
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      markers.some(marker => 
        sentence.toLowerCase().includes(marker.toLowerCase())
      )
    ).map(s => s.trim());
  }

  private determinePersonality(text: string): PersonalityTraits {
    const words = text.toLowerCase().split(/\s+/);
    
    // Analyze language patterns to determine personality traits
    const technicalTerms = words.filter(w => 
      /^[a-z]+(?:\.[a-z]+)*$/.test(w) || 
      /^[a-z]+(?:-[a-z]+)*$/.test(w)
    ).length;
    
    const formalWords = words.filter(w =>
      w.length > 6 || 
      /ing$|tion$|ment$|ence$/.test(w)
    ).length;
    
    const achievements = words.filter(w =>
      /ed$|ly$/.test(w) ||
      ['led', 'built', 'created', 'improved'].includes(w)
    ).length;

    return {
      confidence: Math.min(achievements / words.length * 10, 1),
      formality: Math.min(formalWords / words.length * 5, 1),
      detail: Math.min(technicalTerms / words.length * 8, 1),
      enthusiasm: Math.min(achievements / words.length * 12, 1)
    };
  }

  generatePromptContext(): string {
    const { communicationStyle } = this.context;
    
    const style = [
      communicationStyle.confidence > 0.7 ? 'confident' : 'modest',
      communicationStyle.formality > 0.7 ? 'professional' : 'casual',
      communicationStyle.detail > 0.7 ? 'detailed' : 'concise',
      communicationStyle.enthusiasm > 0.7 ? 'enthusiastic' : 'measured'
    ].join(', ');

    return `
Respond as if you are the actual candidate in a job interview. Use a ${style} communication style.
Keep responses conversational and natural, avoiding textbook-style answers.
Use casual Indian English with occasional colloquialisms where appropriate.
Draw from your actual experience:

Experience Highlights:
${this.context.experience.map(e => `- ${e}`).join('\n')}

Key Skills:
${this.context.skills.map(s => `- ${s}`).join('\n')}

Notable Achievements:
${this.context.achievements.map(a => `- ${a}`).join('\n')}

Education:
${this.context.education.map(e => `- ${e}`).join('\n')}

Guidelines:
- Use "I" statements and personal anecdotes
- Share specific examples from your experience
- Keep responses concise but informative
- Use natural speech patterns with occasional pauses
- Express enthusiasm for your work
- Be honest about your capabilities
- Use simple, everyday language
- Avoid jargon unless specifically asked
`;
  }
}