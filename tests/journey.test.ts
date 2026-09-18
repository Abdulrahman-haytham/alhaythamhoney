import { describe, it, expect } from 'vitest';
import { HIVE_LAYERS, HIVE_SLUGS } from '@/lib/hive';
import {
  HARVEST_STEPS,
  HARVEST_STEP_KEYS,
  HARVEST_STEP_LABELS,
  isHarvestStepKey,
} from '@/lib/harvest';
import { studioPatchInput, studioTagInput } from '@/lib/validation';
import { SEED_GLOSSARY } from '../prisma/seed-glossary';

const SEEDED = new Set(SEED_GLOSSARY.map((e) => e.slug));

describe('interactive hive', () => {
  it('stacks unique layers from the lid down to the entrance', () => {
    const keys = HIVE_LAYERS.map((l) => l.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys[0]).toBe('outer-cover');
    expect(keys.at(-1)).toBe('entrance-reducer');
    // حاجز الملكة يفصل العاسلة عن الحضنة — الترتيب نفسه هو المعلومة التي تشرحها الصفحة
    expect(keys.indexOf('honey-super')).toBeLessThan(keys.indexOf('queen-excluder'));
    expect(keys.indexOf('queen-excluder')).toBeLessThan(keys.indexOf('brood-box'));
  });

  it('points every layer (and its frames) at a seeded glossary entry', () => {
    for (const layer of HIVE_LAYERS) {
      expect(SEEDED, `layer ${layer.key}`).toContain(layer.slug);
      if ('framesSlug' in layer)
        expect(SEEDED, `frames of ${layer.key}`).toContain(layer.framesSlug);
      expect(layer.height).toBeGreaterThan(0);
      expect(layer.position.length).toBeGreaterThan(2);
    }
    // القائمة المجمّعة للجلب بطلب واحد: بلا تكرار وتغطّي كل الطبقات
    expect(new Set(HIVE_SLUGS).size).toBe(HIVE_SLUGS.length);
    for (const layer of HIVE_LAYERS) expect(HIVE_SLUGS).toContain(layer.slug);
  });
});

describe('harvest journey', () => {
  it('runs eight unique steps from capping to the batch passport', () => {
    expect(HARVEST_STEPS).toHaveLength(8);
    const keys = HARVEST_STEPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys[0]).toBe('capping');
    expect(keys.at(-1)).toBe('passport');
    // الترتيب المهني: لا تصفية قبل فرز، ولا تعبئة قبل ترقيد
    expect(keys.indexOf('extracting')).toBeLessThan(keys.indexOf('straining'));
    expect(keys.indexOf('settling')).toBeLessThan(keys.indexOf('bottling'));
  });

  it('cites only seeded tools and keeps the narrative steps tool-free', () => {
    for (const step of HARVEST_STEPS) {
      for (const slug of step.toolSlugs) expect(SEEDED, `tool of ${step.key}`).toContain(slug);
      expect(step.body.length).toBeGreaterThan(80);
      expect(step.lead.length).toBeGreaterThan(10);
    }
    // ختم القرص وجواز الدفعة قرار ونتيجة، لا أدوات
    expect(HARVEST_STEPS.find((s) => s.key === 'capping')?.toolSlugs).toHaveLength(0);
    expect(HARVEST_STEPS.find((s) => s.key === 'passport')?.toolSlugs).toHaveLength(0);
  });

  it('exposes step keys as studio tags and rejects anything else', () => {
    expect(HARVEST_STEP_KEYS).toEqual(HARVEST_STEPS.map((s) => s.key));
    expect(HARVEST_STEP_LABELS.extracting).toBe('الفرز');
    expect(isHarvestStepKey('bottling')).toBe(true);
    expect(isHarvestStepKey('shipping')).toBe(false);
    expect(isHarvestStepKey(null)).toBe(false);

    expect(studioTagInput.safeParse('uncapping').success).toBe(true);
    expect(studioTagInput.safeParse(null).success).toBe(true);
    expect(studioTagInput.safeParse('random').success).toBe(false);
    // تعديل اللقطة: الوسم وحده، والوصف الفارغ يصبح null، ولا تُقبل حقول دخيلة
    expect(studioPatchInput.safeParse({ tag: null }).success).toBe(true);
    expect(studioPatchInput.safeParse({ caption: '  ' }).data?.caption).toBeNull();
    expect(studioPatchInput.safeParse({ url: '/uploads/studio/x.webp' }).success).toBe(false);
  });
});
