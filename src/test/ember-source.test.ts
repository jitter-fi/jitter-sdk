import {expect, test} from 'bun:test';
import {parseEmberApy} from '../services/ember-source.js';
import {EMBER_ESUI} from '../ember-deployment.js';

const now = 1_800_000_000_000;
const vault = {
  id: EMBER_ESUI.vaultObjectId,
  receiptCoin: {address: EMBER_ESUI.receiptType},
  weeklyPerformanceFeeBpsE9: '100000000',
  managementFeePercentE9: '0',
};
const sample = (days: number, apyE9 = '60000000') => ({timestamp: now - days * 86_400_000, apyE9});

test('eSUI launch averages the trailing thirty days and deducts Ember fees exactly', () => {
  const result = parseEmberApy([sample(1, '60000000'), sample(4, '80000000'), sample(31, '990000000')], [vault], now);
  expect(result.apy).toBe('0.063000000000000000');
  expect(result.sampleCount).toBe(2);
  expect(result.performanceFeeBps).toBe(1000);
});

test('eSUI APY rejects an unreviewed fee or another receipt/vault', () => {
  expect(() => parseEmberApy([sample(1)], {...vault, weeklyPerformanceFeeBpsE9: '200000000'}, now)).toThrow('fee');
  expect(() => parseEmberApy([sample(1)], {...vault, id: '0x1'}, now)).toThrow('vault');
  expect(() => parseEmberApy([sample(1)], {...vault, receiptCoin: {address: '0x2::sui::SUI'}}, now)).toThrow('vault');
});

test('eSUI APY rejects stale, future, duplicate, empty and malformed samples', () => {
  for (const history of [[sample(18)], [sample(-1)], [sample(1), sample(1)], [], [sample(1, '-1')]]) {
    expect(() => parseEmberApy(history, vault, now)).toThrow();
  }
  expect(parseEmberApy([sample(17.5)], vault, now).apy).toBe('0.054000000000000000');
});
