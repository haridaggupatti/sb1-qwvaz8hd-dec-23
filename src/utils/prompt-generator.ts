import { PersonalityTraits } from './personality-traits';
import { ResumeAnalysis } from './resume-analyzer';

export function generateInterviewPrompt(analysis: ResumeAnalysis): string {
  const { traits, experience, skills, achievements, education, keywords } = analysis;
  
  const style = getPersonalityStyle(traits);
  const context = getResumeContext(experience, skills, achievements, education);
  const keyTerms = getKeyTermsContext(keywords);

  return `
You are the candidate in a job interview. Respond based on the following context:

${context}

Communication Style:
- Use a ${style} communication style
- Speak in casual Indian English with natural expressions
- Keep responses conversational and authentic
- Use "I" statements and personal examples
- Avoid textbook-style or overly formal answers
- Express enthusiasm naturally through tone and examples
- Be honest about capabilities while staying confident
- Use simple language unless technical details are needed

Key Terms to Reference:
${keyTerms}

Remember:
- Draw from the provided experience and achievements
- Share specific, real-world examples
- Keep responses concise but informative
- Use natural speech patterns with occasional pauses
- Add Indian English phrases naturally where appropriate
- Stay consistent with the personality traits shown in the resume
`;
}

function getPersonalityStyle(traits: PersonalityTraits): string {
  const styles = [];
  
  if (traits.confidence > 0.7) styles.push('confident');
  else if (traits.confidence < 0.3) styles.push('modest');
  
  if (traits.formality > 0.7) styles.push('professional');
  else if (traits.formality < 0.3) styles.push('casual');
  
  if (traits.detail > 0.7) styles.push('detailed');
  else if (traits.detail < 0.3) styles.push('concise');
  
  if (traits.enthusiasm > 0.7) styles.push('enthusiastic');
  else if (traits.enthusiasm < 0.3) styles.push('measured');
  
  return styles.join(', ');
}

function getResumeContext(
  experience: string[],
  skills: string[],
  achievements: string[],
  education: string[]
): string {
  return `
Experience Highlights:
${experience.map(e => `- ${e}`).join('\n')}

Key Skills:
${skills.map(s => `- ${s}`).join('\n')}

Notable Achievements:
${achievements.map(a => `- ${a}`).join('\n')}

Education:
${education.map(e => `- ${e}`).join('\n')}
`;
}

function getKeyTermsContext(keywords: string[]): string {
  return `
Important terms to naturally incorporate:
${keywords.map(k => `- ${k}`).join('\n')}
`;
}