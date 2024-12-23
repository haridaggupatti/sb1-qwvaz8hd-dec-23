import { PersonalityTraits } from './personality-traits';

export interface ResumeAnalysis {
  experience: string[];
  skills: string[];
  achievements: string[];
  education: string[];
  traits: PersonalityTraits;
  keywords: string[];
}

export function analyzeResume(text: string): ResumeAnalysis {
  // Extract sections
  const experience = extractSection(text, [
    'experience',
    'employment',
    'work history',
    'professional background'
  ]);

  const skills = extractSection(text, [
    'skills',
    'technologies',
    'technical skills',
    'competencies'
  ]);

  const achievements = extractSection(text, [
    'achievements',
    'accomplishments',
    'awards',
    'recognition'
  ]);

  const education = extractSection(text, [
    'education',
    'academic',
    'qualifications',
    'certification'
  ]);

  // Analyze personality traits
  const traits = analyzePersonalityTraits(text);

  // Extract important keywords
  const keywords = extractKeywords(text);

  return {
    experience,
    skills,
    achievements,
    education,
    traits,
    keywords
  };
}

function extractSection(text: string, markers: string[]): string[] {
  const sentences = text.split(/[.!?]+/);
  return sentences
    .filter(sentence => 
      markers.some(marker => 
        sentence.toLowerCase().includes(marker)
      )
    )
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short segments
}

function analyzePersonalityTraits(text: string): PersonalityTraits {
  const words = text.toLowerCase().split(/\s+/);
  
  // Analyze confidence through achievement words
  const confidenceWords = [
    'led', 'managed', 'achieved', 'delivered', 'improved',
    'developed', 'created', 'implemented', 'successful'
  ];
  const confidenceScore = calculateTraitScore(words, confidenceWords);

  // Analyze formality through language
  const formalWords = [
    'professional', 'expertise', 'proficient', 'experienced',
    'accomplished', 'demonstrated', 'established'
  ];
  const formalityScore = calculateTraitScore(words, formalWords);

  // Analyze detail orientation
  const detailWords = [
    'specifically', 'detailed', 'analyzed', 'documented',
    'monitored', 'tracked', 'measured', 'evaluated'
  ];
  const detailScore = calculateTraitScore(words, detailWords);

  // Analyze enthusiasm
  const enthusiasmWords = [
    'passionate', 'enthusiastic', 'excited', 'eager',
    'motivated', 'driven', 'dedicated', 'committed'
  ];
  const enthusiasmScore = calculateTraitScore(words, enthusiasmWords);

  return {
    confidence: confidenceScore,
    formality: formalityScore,
    detail: detailScore,
    enthusiasm: enthusiasmScore
  };
}

function calculateTraitScore(words: string[], traitWords: string[]): number {
  const matches = words.filter(word => traitWords.includes(word));
  return Math.min(matches.length / (words.length * 0.1), 1);
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  // Count word frequencies
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  // Sort by frequency and get top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}