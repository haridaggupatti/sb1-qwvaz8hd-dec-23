export interface PersonalityTraits {
  confidence: number;  // 0-1: How confident the responses should be
  formality: number;   // 0-1: How formal/informal the language should be
  detail: number;      // 0-1: How detailed the responses should be
  enthusiasm: number;  // 0-1: Level of enthusiasm in responses
}

export interface PersonaContext {
  experience: string[];
  skills: string[];
  achievements: string[];
  education: string[];
  communicationStyle: PersonalityTraits;
}

export interface LanguageStyle {
  phrases: string[];
  transitions: string[];
  enthusiasmMarkers: string[];
}