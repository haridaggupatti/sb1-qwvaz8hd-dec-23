import { PersonalityTraits } from './types';

export function analyzePersonalityTraits(text: string): PersonalityTraits {
  const words = text.toLowerCase().split(/\s+/);
  
  return {
    confidence: calculateConfidenceScore(words),
    formality: calculateFormalityScore(words),
    detail: calculateDetailScore(words),
    enthusiasm: calculateEnthusiasmScore(words)
  };
}

function calculateConfidenceScore(words: string[]): number {
  const confidenceWords = [
    'led', 'managed', 'achieved', 'delivered', 'improved',
    'developed', 'created', 'implemented', 'successful'
  ];
  return calculateTraitScore(words, confidenceWords);
}

function calculateFormalityScore(words: string[]): number {
  const formalWords = [
    'professional', 'expertise', 'proficient', 'experienced',
    'accomplished', 'demonstrated', 'established'
  ];
  return calculateTraitScore(words, formalWords);
}

function calculateDetailScore(words: string[]): number {
  const detailWords = [
    'specifically', 'detailed', 'analyzed', 'documented',
    'monitored', 'tracked', 'measured', 'evaluated'
  ];
  return calculateTraitScore(words, detailWords);
}

function calculateEnthusiasmScore(words: string[]): number {
  const enthusiasmWords = [
    'passionate', 'enthusiastic', 'excited', 'eager',
    'motivated', 'driven', 'dedicated', 'committed'
  ];
  return calculateTraitScore(words, enthusiasmWords);
}

function calculateTraitScore(words: string[], traitWords: string[]): number {
  const matches = words.filter(word => traitWords.includes(word));
  return Math.min(matches.length / (words.length * 0.1), 1);
}