export class CodeAnalyzer {
  static analyzeComplexity(code: string): string {
    const lines = code.split('\n');
    let complexity = 'O(1)';
    let explanation = '';

    // Look for common patterns that indicate complexity
    const hasNestedLoops = this.hasNestedLoops(lines);
    const hasSingleLoop = this.hasSingleLoop(lines);
    const hasRecursion = this.hasRecursion(lines);

    if (hasNestedLoops) {
      complexity = 'O(n²)';
      explanation = 'The code contains nested loops, resulting in quadratic time complexity.';
    } else if (hasSingleLoop) {
      complexity = 'O(n)';
      explanation = 'The code contains a single loop, resulting in linear time complexity.';
    } else if (hasRecursion) {
      complexity = 'O(log n)';
      explanation = 'The code uses recursion, likely resulting in logarithmic time complexity.';
    }

    return `Time Complexity: ${complexity}\n${explanation}`;
  }

  static suggestImprovements(code: string): string[] {
    const suggestions: string[] = [];

    // Check for common code smells and anti-patterns
    if (code.includes('var ')) {
      suggestions.push('Consider using "let" or "const" instead of "var" for better scoping.');
    }

    if (code.includes('==')) {
      suggestions.push('Use "===" instead of "==" for strict equality comparison.');
    }

    if (code.length > 500) {
      suggestions.push('Consider breaking down the function into smaller, more focused functions.');
    }

    if (this.hasNestedLoops(code.split('\n'))) {
      suggestions.push('Consider optimizing nested loops to improve performance.');
    }

    if (this.hasLongFunctions(code.split('\n'))) {
      suggestions.push('Consider breaking down long functions into smaller, more manageable pieces.');
    }

    return suggestions;
  }

  private static hasNestedLoops(lines: string[]): boolean {
    let loopDepth = 0;
    for (const line of lines) {
      if (line.includes('for') || line.includes('while')) {
        loopDepth++;
        if (loopDepth > 1) return true;
      }
      if (line.includes('}')) loopDepth = Math.max(0, loopDepth - 1);
    }
    return false;
  }

  private static hasSingleLoop(lines: string[]): boolean {
    return lines.some(line => line.includes('for') || line.includes('while'));
  }

  private static hasRecursion(lines: string[]): boolean {
    const functionNames = this.extractFunctionNames(lines);
    return lines.some(line => 
      functionNames.some(name => line.includes(name) && line.includes('return'))
    );
  }

  private static hasLongFunctions(lines: string[]): boolean {
    let currentFunctionLines = 0;
    let inFunction = false;

    for (const line of lines) {
      if (line.includes('function') || line.includes('=>')) {
        inFunction = true;
        currentFunctionLines = 0;
      }
      if (inFunction) {
        currentFunctionLines++;
        if (currentFunctionLines > 20) return true;
      }
      if (line.includes('}')) {
        inFunction = false;
      }
    }
    return false;
  }

  private static extractFunctionNames(lines: string[]): string[] {
    const names: string[] = [];
    const functionDeclaration = /function\s+(\w+)/;
    
    lines.forEach(line => {
      const match = line.match(functionDeclaration);
      if (match) names.push(match[1]);
    });

    return names;
  }

  static formatCode(code: string, language: string): string {
    // Basic code formatting
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Adjust indent level based on braces
      if (trimmedLine.includes('}')) indentLevel = Math.max(0, indentLevel - 1);
      
      // Add indentation
      const formattedLine = '  '.repeat(indentLevel) + trimmedLine;
      
      // Adjust indent level for next line
      if (trimmedLine.includes('{')) indentLevel++;
      
      return formattedLine;
    });

    return formattedLines.join('\n');
  }

  static addLineNumbers(code: string): string {
    const lines = code.split('\n');
    const paddingLength = lines.length.toString().length;
    
    return lines
      .map((line, index) => {
        const lineNumber = (index + 1).toString().padStart(paddingLength, ' ');
        return `${lineNumber} | ${line}`;
      })
      .join('\n');
  }
}