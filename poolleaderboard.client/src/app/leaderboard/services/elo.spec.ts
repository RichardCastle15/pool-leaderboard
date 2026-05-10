import { computeEloDelta, ELO_MAX_DELTA, ELO_MIN_DELTA } from './elo';

describe('computeEloDelta', () => {
  it('returns 50 for equal ratings', () => {
    expect(computeEloDelta(1000, 1000)).toBe(50);
  });

  it('returns 9 when the higher-rated player wins by 400', () => {
    expect(computeEloDelta(1400, 1000)).toBe(9);
  });

  it('returns 91 when the lower-rated player wins by 400', () => {
    expect(computeEloDelta(1000, 1400)).toBe(91);
  });

  it('clamps to floor when the higher-rated player wins by 800', () => {
    expect(computeEloDelta(1800, 1000)).toBe(ELO_MIN_DELTA);
  });

  it('clamps to ceiling when the lower-rated player wins by 800', () => {
    expect(computeEloDelta(1000, 1800)).toBe(ELO_MAX_DELTA);
  });

  it('stays clamped at very large gaps', () => {
    expect(computeEloDelta(3000, 1000)).toBe(ELO_MIN_DELTA);
    expect(computeEloDelta(1000, 3000)).toBe(ELO_MAX_DELTA);
  });

  it('produces complementary deltas when winner and loser are swapped', () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [1000, 1000],
      [1400, 1000],
      [1800, 1000],
      [1100, 1300],
      [3000, 1000],
    ];
    for (const [a, b] of cases) {
      expect(computeEloDelta(a, b) + computeEloDelta(b, a)).toBe(100);
    }
  });
});
