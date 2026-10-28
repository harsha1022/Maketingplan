import { describe, it, expect } from 'vitest';

// ── Leaderboard ranking logic (pure, no Supabase dependency) ──

/**
 * Pure function: rank promoters by registrations descending.
 * Tie-breaker: earlier reached_at timestamp wins.
 */
function rankPromoters(promoters) {
  return [...promoters]
    .sort((a, b) => {
      if (b.registrations !== a.registrations) return b.registrations - a.registrations;
      // Tie-breaker: who reached this count first
      return new Date(a.reached_at) - new Date(b.reached_at);
    })
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

/**
 * Filter to eligible prize winners (top N of a category).
 */
function getPrizeWinners(rankedList, count) {
  return rankedList.slice(0, count);
}

/**
 * Group promoters by category.
 */
function groupByCategory(promoters) {
  return promoters.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});
}

// ── Tests ──────────────────────────────────────────────────────

describe('rankPromoters', () => {
  const sample = [
    { id: '1', name: 'Alice', registrations: 12, category: 'student', reached_at: '2026-10-24T10:00:00Z' },
    { id: '2', name: 'Bob',   registrations:  8, category: 'student', reached_at: '2026-10-24T11:00:00Z' },
    { id: '3', name: 'Carol', registrations: 15, category: 'student', reached_at: '2026-10-23T09:00:00Z' },
  ];

  it('ranks by registrations descending', () => {
    const ranked = rankPromoters(sample);
    expect(ranked[0].name).toBe('Carol');
    expect(ranked[1].name).toBe('Alice');
    expect(ranked[2].name).toBe('Bob');
  });

  it('assigns correct rank numbers', () => {
    const ranked = rankPromoters(sample);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].rank).toBe(3);
  });

  it('does not mutate original array', () => {
    const original = [...sample];
    rankPromoters(sample);
    expect(sample).toEqual(original);
  });
});

describe('Tie-breaking', () => {
  const tied = [
    { id: '1', name: 'Earlier', registrations: 10, category: 'student', reached_at: '2026-10-24T08:00:00Z' },
    { id: '2', name: 'Later',   registrations: 10, category: 'student', reached_at: '2026-10-24T14:00:00Z' },
    { id: '3', name: 'Earliest',registrations: 10, category: 'student', reached_at: '2026-10-23T08:00:00Z' },
  ];

  it('breaks ties by time reached (earlier wins)', () => {
    const ranked = rankPromoters(tied);
    expect(ranked[0].name).toBe('Earliest');
    expect(ranked[1].name).toBe('Earlier');
    expect(ranked[2].name).toBe('Later');
  });
});

describe('getPrizeWinners', () => {
  const ranked = [
    { rank: 1, name: 'A', registrations: 20 },
    { rank: 2, name: 'B', registrations: 15 },
    { rank: 3, name: 'C', registrations: 10 },
    { rank: 4, name: 'D', registrations:  5 },
  ];

  it('returns top N winners (student category = top 3)', () => {
    const winners = getPrizeWinners(ranked, 3);
    expect(winners).toHaveLength(3);
    expect(winners[0].name).toBe('A');
    expect(winners[2].name).toBe('C');
  });

  it('returns top 2 for content creator category', () => {
    const winners = getPrizeWinners(ranked, 2);
    expect(winners).toHaveLength(2);
    expect(winners[1].name).toBe('B');
  });
});

describe('groupByCategory', () => {
  const promoters = [
    { id: '1', name: 'S1', category: 'student', registrations: 5 },
    { id: '2', name: 'S2', category: 'student', registrations: 3 },
    { id: '3', name: 'C1', category: 'club_convener', registrations: 8 },
    { id: '4', name: 'R1', category: 'content_creator', registrations: 6 },
  ];

  it('groups correctly by category', () => {
    const groups = groupByCategory(promoters);
    expect(groups.student).toHaveLength(2);
    expect(groups.club_convener).toHaveLength(1);
    expect(groups.content_creator).toHaveLength(1);
  });

  it('categories are independent — ranking is separate', () => {
    const groups = groupByCategory(promoters);
    const studentRanked = rankPromoters(groups.student);
    const clubRanked    = rankPromoters(groups.club_convener);

    // S1 ranks 1st among students
    expect(studentRanked[0].name).toBe('S1');
    // C1 ranks 1st among clubs (even though 8 > 5, categories are separate)
    expect(clubRanked[0].name).toBe('C1');
  });
});

describe('Registration progress calculation', () => {
  it('calculates percentage correctly', () => {
    const pct = (current, target) => Math.min((current / target) * 100, 100).toFixed(1);
    expect(pct(250, 500)).toBe('50.0');
    expect(pct(500, 500)).toBe('100.0');
    expect(pct(600, 500)).toBe('100.0'); // capped at 100
    expect(pct(0, 500)).toBe('0.0');
  });

  it('calculates remaining correctly', () => {
    const remaining = (current, target) => Math.max(target - current, 0);
    expect(remaining(250, 500)).toBe(250);
    expect(remaining(500, 500)).toBe(0);
    expect(remaining(600, 500)).toBe(0); // no negative remaining
  });
});

describe('No double-counting', () => {
  it('counts only confirmed unique registrations', () => {
    const registrations = [
      { status: 'confirmed',  email: 'a@x.com' },
      { status: 'confirmed',  email: 'b@x.com' },
      { status: 'duplicate',  email: 'a@x.com' }, // should not count
      { status: 'invalid',    email: 'c@x.com' }, // should not count
      { status: 'demo',       email: 'd@x.com' }, // demo — separate count
    ];

    const confirmed = registrations.filter(r => r.status === 'confirmed');
    expect(confirmed.length).toBe(2);

    // Unique normalized emails among confirmed
    const uniqueEmails = new Set(confirmed.map(r => r.email.toLowerCase()));
    expect(uniqueEmails.size).toBe(2);
  });
});
