import {expect, test} from 'bun:test';
import {EMBER_EEARN, EMBER_ESUI, reviewedEmberDeployment, STABLECOIN_ASSETS} from '../ember-deployment.js';
import {parseEmberApy} from '../services/ember-source.js';

test('reviewed eEARN binds a distinct USDC vault and six-decimal receipt', () => {
  expect(EMBER_EEARN.underlyingType).toBe(STABLECOIN_ASSETS.USDC.type);
  expect(EMBER_EEARN.decimals).toBe(6);
  expect(EMBER_EEARN.vaultObjectId).not.toBe(EMBER_ESUI.vaultObjectId);
  expect(reviewedEmberDeployment(EMBER_EEARN.vaultObjectId)).toBe(EMBER_EEARN);
  expect(() => reviewedEmberDeployment('0x123')).toThrow('Unreviewed');
  expect(EMBER_EEARN.maxStalenessMs).toBe(1_512_000_000);
});

test('eEARN APY uses its own identity and zero performance fee', () => {
  const now = 1_800_000_000_000;
  const history = [{timestamp: now - 86400000, apyE9: '100000000'}];
  const vault = {id: EMBER_EEARN.vaultObjectId, receiptCoin: {address: EMBER_EEARN.receiptType}, weeklyPerformanceFeeBpsE9: '0', managementFeePercentE9: '0'};
  expect(parseEmberApy(history, vault, now, EMBER_EEARN).apy).toBe('0.100000000000000000');
  expect(parseEmberApy(history, vault, now, EMBER_EEARN).performanceFeeBps).toBe(0);
  expect(() => parseEmberApy(history, vault, now)).toThrow('vault');
  expect(() => parseEmberApy(history, {...vault, weeklyPerformanceFeeBpsE9: '100000000'}, now, EMBER_EEARN)).toThrow('fee');
});
