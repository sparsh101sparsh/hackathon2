/**
 * Competitive-programming output comparison ignores line endings and harmless
 * whitespace around common collection punctuation while preserving word
 * boundaries in textual answers.
 */
export function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
    .replace(/\s*,\s*/g, ',')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}');
}
