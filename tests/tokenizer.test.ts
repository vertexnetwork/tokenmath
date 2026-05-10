import { describe, expect, it } from 'vitest';
import { countTokens } from '@/lib/tokenizers';

describe('countTokens', () => {
  it('returns 0 for empty input', async () => {
    const result = await countTokens('claude-4-5-sonnet', '');
    expect(result.tokens).toBe(0);
    expect(result.approx).toBe(true);
  });

  it('produces a sensible Claude count for "hello world"', async () => {
    const result = await countTokens('claude-4-5-sonnet', 'hello world');
    // cl100k_base tokenizes "hello world" as 2 tokens; allow ±1 for any vocab drift.
    expect(result.tokens).toBeGreaterThanOrEqual(1);
    expect(result.tokens).toBeLessThanOrEqual(3);
    expect(result.source).toBe('gpt-tokenizer-cl100k');
  });

  it('produces a sensible Gemini count for "hello world"', async () => {
    const result = await countTokens('gemini-2-5-pro', 'hello world');
    expect(result.tokens).toBeGreaterThanOrEqual(1);
    expect(result.tokens).toBeLessThanOrEqual(3);
    expect(result.source).toBe('gemini-approx');
  });

  it('scales with input length monotonically', async () => {
    const short = await countTokens('claude-4-5-sonnet', 'one two three');
    const long = await countTokens(
      'claude-4-5-sonnet',
      'one two three four five six seven eight nine ten eleven twelve',
    );
    expect(long.tokens).toBeGreaterThan(short.tokens);
  });

  it('flags approximate output', async () => {
    const result = await countTokens('claude-4-7-opus', 'The quick brown fox.');
    expect(result.approx).toBe(true);
    expect(result.ms).toBeGreaterThanOrEqual(0);
  });

  it('reports exact (non-approx) counts for OpenAI', async () => {
    const result = await countTokens('gpt-5', 'Hello, world!');
    expect(result.approx).toBe(false);
    expect(result.source).toBe('gpt-tokenizer-o200k');
    expect(result.tokens).toBeGreaterThanOrEqual(1);
    expect(result.tokens).toBeLessThanOrEqual(5);
  });

  it('routes GPT-4.1 to o200k', async () => {
    const result = await countTokens('gpt-4-1', 'one two three four five');
    expect(result.source).toBe('gpt-tokenizer-o200k');
    expect(result.approx).toBe(false);
  });
});
