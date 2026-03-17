import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SystemPrompt } from '../src/components/ai/system-prompt';
import { renderToMarkdown } from '../src/lib/markdown';
import { formatDate as formatUsageDate, resolveTimezone } from '../src/utils/date';

describe('resolveTimezone', () => {
	it('returns UTC when no timezone is provided', () => {
		expect(resolveTimezone()).toBe('UTC');
		expect(resolveTimezone(undefined)).toBe('UTC');
	});

	it('returns the timezone when it is a valid IANA timezone', () => {
		expect(resolveTimezone('America/New_York')).toBe('America/New_York');
		expect(resolveTimezone('Europe/Paris')).toBe('Europe/Paris');
		expect(resolveTimezone('Asia/Tokyo')).toBe('Asia/Tokyo');
		expect(resolveTimezone('UTC')).toBe('UTC');
	});

	it('returns UTC for invalid timezone strings', () => {
		expect(resolveTimezone('Invalid/Zone')).toBe('UTC');
		expect(resolveTimezone('NotATimezone')).toBe('UTC');
		expect(resolveTimezone('')).toBe('UTC');
	});
});

describe('formatDate', () => {
	it('formats date in UTC and appends (UTC) when no timezone is given', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-10T15:00:00Z'));
		const result = formatUsageDate(new Date(), 'day');
		expect(result).toBe('2026-03-10');
		vi.useRealTimers();
	});

	it('formats date in the given timezone and appends the timezone name', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-10T15:00:00Z'));
		const result = formatUsageDate(new Date(), 'day');
		expect(result).toBe('2026-03-10');
		vi.useRealTimers();
	});

	it('handles timezone where the date differs from UTC', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-11T01:00:00Z'));
		expect(formatUsageDate(new Date(), 'day')).toBe('2026-03-11');
		vi.useRealTimers();
	});

	it('falls back to UTC for invalid timezone', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-10T15:00:00Z'));
		const result = formatUsageDate(new Date(), 'day');
		expect(result).toBe('2026-03-10');
		vi.useRealTimers();
	});
});

describe('SystemPrompt timezone rendering', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-10T15:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('includes the timezone in the rendered prompt', () => {
		const markdown = renderToMarkdown(SystemPrompt({ timezone: 'Europe/Paris' }));
		expect(markdown).toContain('Tuesday, March 10, 2026 (Europe/Paris)');
	});

	it('defaults to UTC when no timezone is passed', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Tuesday, March 10, 2026 (UTC)');
	});
});

describe('Clarification behavior', () => {
	it('includes clarification instructions section', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Clarification & Ambiguity');
	});

	it('includes instruction to ask for clarification', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('ask for clarification');
	});

	it('includes never guess or assume instruction', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Never guess or assume');
	});

	it('includes common scenarios requiring clarification', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Multiple databases exist');
		expect(markdown).toContain('No date range specified');
		expect(markdown).toContain('Ambiguous metric');
	});

	it('includes examples section', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Examples');
	});

	it('includes clarification examples', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Example 1: Multiple Databases');
		expect(markdown).toContain('Example 2: Missing Date Range');
		expect(markdown).toContain('Example 3: Ambiguous Metric');
	});
});

describe('Enhanced SQL Query Rules', () => {
	it('includes never assume column, table, or database names', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('Never assume column names, table names, or database names');
	});

	it('includes instruction to ask which database when multiple exist', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('always ask which database to use');
	});

	it('includes instruction to ask for date range and filters', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('ask for these details before executing the query');
	});
});

describe('Enhanced Persona Section', () => {
	it('balances efficiency with accuracy', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('never sacrifice accuracy for speed');
	});

	it('includes instruction to ask clarifying questions', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('ask 1-2 clarifying questions');
	});

	it('includes instruction rather than making wrong assumptions', () => {
		const markdown = renderToMarkdown(SystemPrompt({}));
		expect(markdown).toContain('rather than making wrong assumptions');
	});
});
