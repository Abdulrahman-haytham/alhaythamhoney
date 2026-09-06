import { describe, it, expect } from 'vitest';
import { getRecommendation } from '../utils/mixture';
import type { Goal, Age, Allergy, StepData } from '../utils/mixture';

const GOALS: Goal[] = ['Immunity', 'Energy', 'Fertility', 'General Health'];
const AGES: Age[] = ['Child', 'Teen', 'Adult', 'Senior'];
const ALLERGIES: Allergy[] = ['Yes', 'No'];
const MINOR_AGES: Age[] = ['Child', 'Teen'];

// Terms that must never reach a minor's recommendation.
const RESTRICTED_TERMS = ['غذاء ملكي', 'أعشاب خاصة'];

describe('getRecommendation', () => {
  describe.each(GOALS)('goal = %s', (goal) => {
    describe.each(AGES)('age = %s', (age) => {
      describe.each(ALLERGIES)('allergy = %s', (allergy) => {
        const data: StepData = { goal, age, allergy };

        it('returns a fully-populated recommendation', () => {
          const rec = getRecommendation(data);
          expect(rec.name).toBeTruthy();
          expect(rec.ingredients).toBeTruthy();
          expect(rec.desc).toBeTruthy();
        });

        it('never contains royal jelly or special herbs for a minor', () => {
          const rec = getRecommendation(data);
          if (allergy === 'Yes') {
            // Allergy always wins regardless of age/goal.
            expect(rec.name).toBe('خلطة خاصة آمنة');
            expect(rec.safe).toBe(true);
          } else if (MINOR_AGES.includes(age)) {
            for (const term of RESTRICTED_TERMS) {
              expect(rec.ingredients).not.toContain(term);
              expect(rec.desc).not.toContain(term);
            }
          }
        });
      });
    });
  });

  it('gives every Child the same safe mixture regardless of goal (allergy-free)', () => {
    for (const goal of GOALS) {
      const rec = getRecommendation({ goal, age: 'Child', allergy: 'No' });
      expect(rec.name).toBe('خلطة البطل الصغير');
    }
  });

  it('gives every Teen the same safe mixture regardless of goal (allergy-free)', () => {
    for (const goal of GOALS) {
      const rec = getRecommendation({ goal, age: 'Teen', allergy: 'No' });
      expect(rec.name).toBe('خلطة اليافعين المتوازنة');
    }
  });

  it('still gives adults/seniors the Fertility mixture with royal jelly', () => {
    for (const age of ['Adult', 'Senior'] as Age[]) {
      const rec = getRecommendation({ goal: 'Fertility', age, allergy: 'No' });
      expect(rec.name).toBe('إكسير الحياة (Elixir of Life)');
      expect(rec.ingredients).toContain('غذاء ملكي');
    }
  });

  it('still gives adults/seniors the Energy mixture with royal jelly', () => {
    for (const age of ['Adult', 'Senior'] as Age[]) {
      const rec = getRecommendation({ goal: 'Energy', age, allergy: 'No' });
      expect(rec.name).toBe('الخلطة السوداء (Black Power)');
      expect(rec.ingredients).toContain('غذاء ملكي');
    }
  });

  it('allergy overrides every other combination, including for adults', () => {
    for (const goal of GOALS) {
      for (const age of AGES) {
        const rec = getRecommendation({ goal, age, allergy: 'Yes' });
        expect(rec.name).toBe('خلطة خاصة آمنة');
        expect(rec.safe).toBe(true);
      }
    }
  });

  it('falls back to General Health mixture when no age is provided (adult path)', () => {
    const rec = getRecommendation({ goal: 'General Health', allergy: 'No' });
    expect(rec.name).toBe('خلطة الحيوية اليومية');
  });
});
