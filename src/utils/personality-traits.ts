export interface PersonalityTraits {
  confidence: number;  // 0-1: How confident the responses should be
  formality: number;  // 0-1: How formal/informal the language should be
  detail: number;     // 0-1: How detailed the responses should be
  enthusiasm: number; // 0-1: Level of enthusiasm in responses
}

export const INDIAN_ENGLISH_PHRASES = [
  'you see',
  'actually',
  'basically',
  'only',
  'itself',
  'itself only',
  'like that only',
  'doing the needful',
  'tell me',
  'I will tell you',
  'let me explain',
  'see',
  'na',
  'no',
  'yaar',
  'means'
];

export const CASUAL_TRANSITIONS = [
  'So basically',
  'You know what',
  'Let me tell you',
  'See',
  'Actually',
  'The thing is',
  'I mean',
  'Like',
  'Basically'
];

export const ENTHUSIASM_MARKERS = [
  'really',
  'very',
  'quite',
  'absolutely',
  'definitely',
  'totally',
  'completely',
  'honestly',
  'truly'
];

export function addIndianEnglishFlavor(text: string, traits: PersonalityTraits): string {
  // Add casual Indian English phrases based on formality level
  if (traits.formality < 0.6) {
    const phrases = INDIAN_ENGLISH_PHRASES.slice(0, Math.floor((1 - traits.formality) * 10));
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    text = `${randomPhrase}, ${text.toLowerCase()}`;
  }

  // Add enthusiasm markers based on enthusiasm level
  if (traits.enthusiasm > 0.7) {
    const markers = ENTHUSIASM_MARKERS.slice(0, Math.floor(traits.enthusiasm * 5));
    const randomMarker = markers[Math.floor(Math.random() * markers.length)];
    text = text.replace(/\b(good|great|excellent)\b/gi, `${randomMarker} $1`);
  }

  // Add casual transitions based on formality level
  if (traits.formality < 0.5) {
    const transitions = CASUAL_TRANSITIONS.slice(0, Math.floor((1 - traits.formality) * 5));
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    text = `${randomTransition}, ${text}`;
  }

  return text;
}