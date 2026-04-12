import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WEIGHT_RANGE_ORDER, COMPATIBILITY_REQUIRED_CATEGORIES, SUPPORTED_CITIES } from '../lib/constants';

describe('Constants', () => {
  it('weight range ordering should be strictly increasing', () => {
    assert.ok(WEIGHT_RANGE_ORDER.SMALL < WEIGHT_RANGE_ORDER.MEDIUM);
    assert.ok(WEIGHT_RANGE_ORDER.MEDIUM < WEIGHT_RANGE_ORDER.LARGE);
    assert.ok(WEIGHT_RANGE_ORDER.LARGE < WEIGHT_RANGE_ORDER.GIANT);
  });

  it('compatibility required categories should include BOARDING and SITTING', () => {
    assert.ok(COMPATIBILITY_REQUIRED_CATEGORIES.includes('BOARDING'));
    assert.ok(COMPATIBILITY_REQUIRED_CATEGORIES.includes('SITTING'));
  });

  it('supported cities should include major Indian cities', () => {
    assert.ok(SUPPORTED_CITIES.includes('Mumbai'));
    assert.ok(SUPPORTED_CITIES.includes('Bangalore'));
    assert.ok(SUPPORTED_CITIES.includes('Delhi'));
  });
});
