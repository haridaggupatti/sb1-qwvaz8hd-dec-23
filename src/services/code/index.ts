import { ExecutionService } from './execution-service';
import { AnalysisService } from './analysis-service';
import { FormattingService } from './formatting-service';

// Export unified code services
export const codeServices = {
  execution: new ExecutionService(),
  analysis: new AnalysisService(),
  formatting: new FormattingService()
};