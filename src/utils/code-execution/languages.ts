import { LanguageConfig } from './types';

export const supportedLanguages: Record<string, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    defaultCode: `function example() {\n  console.log("Hello, World!");\n}\n\nexample();`,
    version: 'ES2020'
  },
  typescript: {
    name: 'TypeScript',
    extension: 'ts',
    defaultCode: `function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("World"));`,
    version: '5.0'
  },
  python: {
    name: 'Python',
    extension: 'py',
    defaultCode: `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))`,
    version: '3.9'
  },
  java: {
    name: 'Java',
    extension: 'java',
    defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    version: '17'
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    defaultCode: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
    version: '17'
  },
  c: {
    name: 'C',
    extension: 'c',
    defaultCode: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    version: 'C11'
  },
  rust: {
    name: 'Rust',
    extension: 'rs',
    defaultCode: `fn main() {\n    println!("Hello, World!");\n}`,
    version: '1.75'
  },
  go: {
    name: 'Go',
    extension: 'go',
    defaultCode: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
    version: '1.21'
  },
  php: {
    name: 'PHP',
    extension: 'php',
    defaultCode: `<?php\nfunction greet($name) {\n    return "Hello, $name!";\n}\n\necho greet("World");`,
    version: '8.2'
  },
  ruby: {
    name: 'Ruby',
    extension: 'rb',
    defaultCode: `def greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")`,
    version: '3.2'
  },
  sql: {
    name: 'SQL',
    extension: 'sql',
    defaultCode: `CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);\n\nINSERT INTO users VALUES (1, 'John');`,
    version: 'PostgreSQL 15'
  },
  bash: {
    name: 'Bash',
    extension: 'sh',
    defaultCode: `#!/bin/bash\necho "Hello, World!"`,
    version: '5.1'
  },
  csharp: {
    name: 'C#',
    extension: 'cs',
    defaultCode: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
    version: '12'
  }
};