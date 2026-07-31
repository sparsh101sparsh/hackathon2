type TutorFallbackOptions = {
  title: string;
  language: string;
  userCode: string;
  userMessage: string;
  context: string;
};

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function extractTemplate(context: string, language: string) {
  const escapedLanguage = language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = context.match(new RegExp(`Reference solution template \\(${escapedLanguage}\\):\\n([\\s\\S]*?)(?=\\n\\n[A-Z][^\\n]*:|$)`, 'i'));
  return match?.[1]?.trim() || '';
}

export function buildTutorFallbackReply(options: TutorFallbackOptions): string {
  const message = options.userMessage.trim();
  const normalized = message.toLowerCase();
  const title = options.title || 'this problem';
  const language = options.language || 'cpp';
  const template = extractTemplate(options.context, language);

  if (hasAny(normalized, ['whole code', 'full code', 'write the code', 'give me code', 'code for', 'implementation', 'solution code'])) {
    if (template) {
      return `Here is the ${language} reference implementation for **${title}**:\n\n\`\`\`${language}\n${template}\n\`\`\`\n\nRun it against the sample cases first. Then I can walk through any line or adapt it to your current code.`;
    }
    return `I can help write the implementation for **${title}** in ${language}, but the reference template is not available in this request. Share your current function signature or code and I will complete it against the canonical statement and examples.`;
  }

  if (hasAny(normalized, ['error', 'bug', 'wrong', 'fail', 'not working', 'issue'])) {
    return `Let us debug **${title}** from the actual failure. Paste the compiler/runtime output and the smallest input that reproduces it. I will trace the failing state against your ${language} code instead of guessing.`;
  }

  if (hasAny(normalized, ['complexity', 'optimize', 'faster', 'time', 'space'])) {
    return `For **${title}**, first identify the repeated operation in your current approach. Count how often it runs as the input grows, then check whether a hash table, monotonic structure, sorting step, or dynamic-programming state can remove that repetition. Share the current code and I will calculate its exact time and space complexity.`;
  }

  if (hasAny(normalized, ['edge case', 'test case', 'example', 'input'])) {
    return `For **${title}**, test the smallest valid input, an empty or singleton input when allowed, duplicate values, boundary values, and the case where no answer exists. Tell me which case is confusing and I will trace it step by step using the canonical examples.`;
  }

  if (hasAny(normalized, ['hint', 'clue', 'stuck', 'where do i start'])) {
    return `Start with the invariant for **${title}**: what must remain true after each iteration? State what your pointer, frontier, or table means before changing it. Share your first attempt and I will give one targeted hint without jumping to the solution.`;
  }

  if (options.userCode.trim()) {
    return `I can see your current ${language} attempt for **${title}**. Tell me whether you want a correctness trace, complexity review, debugging help, or a complete implementation, and I will focus on that specific request.`;
  }

  return `I’m ready to help with **${title}**. Ask for a hint, a correctness trace, complexity analysis, edge cases, or the complete ${language} implementation, and I’ll answer that specific request.`;
}
