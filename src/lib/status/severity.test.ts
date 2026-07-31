import {
  SEVERITY_ORDER,
  TONE_SEVERITY,
  severityForTone,
  severityWeight,
  compareSeverity,
  isAtLeastSeverity,
  severityForReviewSeverity,
} from './severity';
import type { StatusTone } from './types';
import type { ReviewSeverity } from '@/lib/complianceReview';

describe('severityForTone / TONE_SEVERITY', () => {
  it('maps every tone to a severity', () => {
    const tones: StatusTone[] = ['success', 'neutral', 'caution', 'critical', 'unknown'];
    for (const tone of tones) {
      expect(SEVERITY_ORDER).toContain(severityForTone(tone));
      expect(TONE_SEVERITY[tone]).toBe(severityForTone(tone));
    }
  });

  it('maps success to the lowest severity and critical to the highest', () => {
    expect(severityForTone('success')).toBe('none');
    expect(severityForTone('critical')).toBe('critical');
  });
});

describe('severityWeight / compareSeverity', () => {
  it('orders severities from none to critical', () => {
    expect(severityWeight('none')).toBeLessThan(severityWeight('low'));
    expect(severityWeight('low')).toBeLessThan(severityWeight('medium'));
    expect(severityWeight('medium')).toBeLessThan(severityWeight('high'));
    expect(severityWeight('high')).toBeLessThan(severityWeight('critical'));
  });

  it('compareSeverity sorts ascending by urgency', () => {
    const shuffled = ['critical', 'none', 'high', 'low', 'medium'] as const;
    const sorted = [...shuffled].sort(compareSeverity);
    expect(sorted).toEqual(['none', 'low', 'medium', 'high', 'critical']);
  });

  it('can sort a mixed list of statuses by severity, most urgent first', () => {
    const severities = ['low', 'critical', 'none', 'high'] as const;
    const sorted = [...severities].sort((a, b) => compareSeverity(b, a));
    expect(sorted).toEqual(['critical', 'high', 'low', 'none']);
  });
});

describe('isAtLeastSeverity', () => {
  it('returns true when severity meets or exceeds the threshold', () => {
    expect(isAtLeastSeverity('critical', 'high')).toBe(true);
    expect(isAtLeastSeverity('high', 'high')).toBe(true);
  });

  it('returns false when severity is below the threshold', () => {
    expect(isAtLeastSeverity('low', 'high')).toBe(false);
    expect(isAtLeastSeverity('none', 'low')).toBe(false);
  });
});

describe('severityForReviewSeverity', () => {
  it('losslessly maps every ReviewSeverity value into StatusSeverity', () => {
    const reviewSeverities: ReviewSeverity[] = ['low', 'medium', 'high', 'critical'];
    for (const severity of reviewSeverities) {
      expect(severityForReviewSeverity(severity)).toBe(severity);
    }
  });
});
