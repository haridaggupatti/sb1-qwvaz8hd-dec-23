import { openaiService } from '../openai';

export class AnalysisService {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async analyzeCode(code: string, language: string) {
    const cacheKey = `${language}:${code}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const { result, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.CACHE_TTL) {
        return result;
      }
    }

    // Perform analysis
    const [explanation, suggestions] = await Promise.all([
      openaiService.explainCode(code, language),
      openaiService.suggestImprovements(code, language)
    ]);

    const result = { explanation, suggestions };
    
    // Cache result
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  async improveCode(code: string, language: string) {
    return openaiService.fixCode(code, language);
  }
}