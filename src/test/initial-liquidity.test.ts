import {expect, test} from 'bun:test';
import {bcs} from '@mysten/sui/bcs';
import {JitterClient} from '../client.js';
import type {JitterMarketConfig} from '../types.js';
const id = (n: number) => `0x${n.toString(16).padStart(64,'0')}`;
const config: JitterMarketConfig = {jitterPackageId: id(1), jitterConfigPackageId: id(2), oraclePackageId: id(3), demoAdapterPackageId: '', demoMarketVaultObjectId: '', aclObjectId: id(4), syStateObjectId: id(5), globalConfigObjectId: id(6), rewardDistributorObjectId: id(7), marketObjectId: id(8), pyStateObjectId: id(8), poolObjectId: id(8), priceAggregatorObjectId: id(9), scallopAdapterPackageId: id(10), scallopProtocolPackageId: id(11), scallopMarketVaultObjectId: id(12), scallopMarketObjectId: id(13), scallopVersionObjectId: id(14), underlyingTypeTag: '0x2::sui::SUI', syTypeTag: `${id(20)}::SY::SY`, ptTypeTag: `${id(21)}::PT::PT`, ytTypeTag: `${id(22)}::YT::YT`, scallopMarketCoinTypeTag: `${id(30)}::reserve::MarketCoin<0x2::sui::SUI>`};
const input = {underlyingAmount: 100_000_000_000n, minLpOut: 47_000_000_000n, deadlineMs: 1_800_000_000_000n, adminCapId: id(40), senderAddress: id(50)};
const points = {enabled: true, liquidlinkPackageId: id(70), liquidlinkGlobalConfigObjectId: id(71),
  projectObjectId: id(72), scoreboardObjectId: id(73), pointConfigObjectId: id(74), lpPointStateObjectId: id(75)};

test('first funding initializes the funded withdrawal window atomically, never before the deposit', () => {
  const data = JitterClient.fromConfig('mainnet', config).buildInitializeScallopLiquidityTx(input).getData();
  const refreshes = data.commands.flatMap((command, index) => command.MoveCall?.function === 'refresh_withdraw_circuit_breaker_by_admin' ? [{index, call: command.MoveCall}] : []);
  expect(refreshes).toHaveLength(1);
  const refresh = refreshes[0]!;
  expect(refresh.index).toBeGreaterThan(data.commands.findIndex(c => c.MoveCall?.function === 'deposit'));
  expect(refresh.index).toBeGreaterThan(data.commands.findIndex(c => c.MoveCall?.function === 'initialize_pool_by_admin'));
  expect(refresh.call.package).toBe(id(10));
  expect(refresh.call.arguments).toHaveLength(4);
  expect(refresh.call.typeArguments).toEqual([config.underlyingTypeTag, config.syTypeTag, config.ptTypeTag, config.ytTypeTag]);
  const ids = refresh.call.arguments.slice(0, 3).map(arg => arg.$kind === 'Input' && data.inputs[arg.Input]?.UnresolvedObject?.objectId);
  expect(ids).toEqual([input.adminCapId, config.globalConfigObjectId, config.scallopMarketVaultObjectId]);
});
test('initialization encodes exact raw amounts, actual half coin split, AdminCap and deadline', () => {
  const data = JitterClient.fromConfig('mainnet', config).buildInitializeScallopLiquidityTx(input).getData();
  const call = (name: string) => data.commands.find(c => c.MoveCall?.function === name)!.MoveCall!;
  const value = (arg: unknown) => {
    if (!arg || typeof arg !== 'object' || !('Input' in arg) || typeof arg.Input !== 'number') throw new Error('Expected pure input');
    const input = data.inputs[arg.Input];
    if (input?.$kind !== 'Pure') throw new Error('Expected pure input');
    return bcs.u64().parse(Buffer.from(input.Pure.bytes, 'base64'));
  };
  expect(value(call('mint_sy_exact_in_market_state').arguments[3]!)).toBe(input.underlyingAmount.toString());
  expect(value(call('divide_into_n').arguments[1]!)).toBe('2');
  const init = call('initialize_pool_by_admin');
  expect(init.arguments).toHaveLength(13);
  expect(value(init.arguments[5]!)).toBe(input.minLpOut.toString());
  expect(value(init.arguments[10]!)).toBe(input.deadlineMs.toString());
  const admin = init.arguments[11]!;
  if (admin.$kind !== 'Input') throw new Error('Expected AdminCap input');
  const adminInput = data.inputs[admin.Input];
  if (adminInput?.$kind !== 'UnresolvedObject') throw new Error('Expected AdminCap object');
  expect(adminInput.UnresolvedObject.objectId).toBe(id(40));
  expect(init.arguments[4]?.$kind).toBe('NestedResult');
  expect(data.sender).toBe(input.senderAddress);
});
test('new non-empty position stays with Admin using transfer proofs, never public transfer or empty-position transfer', () => {
  const data = JitterClient.fromConfig('mainnet', config).buildInitializeScallopLiquidityTx(input).getData();
  const calls = data.commands.flatMap(c => c.MoveCall ? [c.MoveCall] : []);
  expect(calls.some(c => c.function === 'add_lp_keep_yt' || c.function === 'transfer_empty_position')).toBe(false);
  expect(calls.filter(c => c.function === 'begin_transfer_operation')).toHaveLength(2);
  expect(calls.filter(c => c.function === 'finish_operation')).toHaveLength(4);
  const transfer = calls.find(c => c.function === 'transfer_position')!;
  const argument = transfer.arguments[6]!;
  if (argument.$kind !== 'Input') throw new Error('Expected recipient input');
  const recipient = data.inputs[argument.Input];
  if (recipient?.$kind !== 'Pure') throw new Error('Expected pure recipient');
  expect(bcs.Address.parse(Buffer.from(recipient.Pure.bytes, 'base64'))).toBe(input.senderAddress);
  const coins = data.commands.find(c => c.TransferObjects)!.TransferObjects!;
  expect(coins.objects).toHaveLength(2); // Only SY/receipt dust coins; Position uses the guarded router transfer.
});
test('no zero minimum, disabled deadline or overflowing raw funding can build an initial transaction', () => {
  const client = JitterClient.fromConfig('mainnet', config);
  for (const change of [{minLpOut: 0n}, {deadlineMs: 0n}, {underlyingAmount: 0n}, {underlyingAmount: 1n << 64n}]) expect(() => client.buildInitializeScallopLiquidityTx({...input, ...change})).toThrow();
});

const haedalConfig: JitterMarketConfig = { ...config, adapterKind: 'haedal',
  haedalAdapterPackageId: id(61), haedalMarketVaultObjectId: id(62), haedalStakingObjectId: id(63),
  haedalProtocolPackageId: id(64), jitterMathPackageId: id(65),
  scallopAdapterPackageId: undefined, scallopMarketVaultObjectId: undefined };

test('Haedal first LP stakes actual receipts, splits actual SY 50/50, keeps YT and LP with Admin, then initializes breaker', () => {
  const data = JitterClient.fromConfig('mainnet', haedalConfig).buildInitializeHaedalLiquidityTx(input).getData();
  const calls = data.commands.flatMap((c, index) => c.MoveCall ? [{ ...c.MoveCall, index }] : []);
  const call = (name: string) => calls.find(c => c.function === name)!;
  expect(call('request_stake_coin').index).toBeLessThan(call('deposit').index);
  expect(call('mint_sy_exact_in_market_state').arguments[3]?.$kind).toBe('Result');
  expect(call('divide_into_n').index).toBeGreaterThan(call('deposit').index);
  expect(call('mint_py').arguments[3]?.$kind).toBe('Result');
  expect(call('initialize_pool_by_admin').arguments[4]?.$kind).toBe('NestedResult');
  const refresh = call('refresh_withdraw_circuit_breaker_by_admin');
  expect(refresh.index).toBeGreaterThan(call('initialize_pool_by_admin').index);
  expect(refresh.package).toBe(id(61));
  expect(refresh.typeArguments).toEqual([config.syTypeTag, config.ptTypeTag, config.ytTypeTag]);
  expect(refresh.arguments).toHaveLength(4);
  expect(calls.some(c => /scallop|unstake/.test(c.module + c.function))).toBe(false);
  expect(calls.filter(c => c.module === 'haedal_price_ticket' && c.function === 'quote')).toHaveLength(3);
  expect(calls.filter(c => c.function === 'begin_transfer_operation')).toHaveLength(2);
  const recipient = call('transfer_position').arguments[6]!;
  if (recipient.$kind !== 'Input') throw new Error('Expected recipient');
  const pure = data.inputs[recipient.Input];
  if (pure?.$kind !== 'Pure') throw new Error('Expected address');
  expect(bcs.Address.parse(Buffer.from(pure.Pure.bytes, 'base64'))).toBe(input.senderAddress);
});

test('Haedal initial LP refuses invalid funding, minimum, deadline and missing math deployment', () => {
  const client = JitterClient.fromConfig('mainnet', haedalConfig);
  for (const change of [{ minLpOut: 0n }, { underlyingAmount: 0n }, { deadlineMs: 0n }, { underlyingAmount: 1n << 64n }])
    expect(() => client.buildInitializeHaedalLiquidityTx({ ...input, ...change })).toThrow();
  expect(() => JitterClient.fromConfig('mainnet', { ...haedalConfig, jitterMathPackageId: undefined }).buildInitializeHaedalLiquidityTx(input)).toThrow('jitterMathPackageId');
});

const emberConfig: JitterMarketConfig = {...config, adapterKind: 'ember',
  emberAdapterPackageId: id(81), emberMarketVaultObjectId: id(82), emberVaultObjectId: id(83),
  emberVaultsPackageId: id(84), emberProtocolConfigObjectId: id(85),
  emberReceiptTypeTag: `${id(86)}::esui::ESUI`, jitterMathPackageId: id(65),
  scallopAdapterPackageId: undefined, scallopMarketVaultObjectId: undefined};

test('Ember initial liquidity deposits actual shares and initializes its funded receipt breaker', () => {
  const data = JitterClient.fromConfig('mainnet', emberConfig).buildInitializeEmberLiquidityTx(input).getData();
  const calls = data.commands.flatMap((c, index) => c.MoveCall ? [{...c.MoveCall, index}] : []);
  const deposit = calls.find(c => c.function === 'deposit_asset_v2')!;
  const mint = calls.find(c => c.function === 'mint_sy_exact_in_market_state')!;
  expect(deposit.package).toBe(emberConfig.emberVaultsPackageId!);
  expect(mint.arguments[3]?.$kind).toBe('Result');
  expect(deposit.index).toBeLessThan(mint.index);
  const refresh = calls.find(c => c.function === 'refresh_withdraw_circuit_breaker_by_admin')!;
  expect(refresh.package).toBe(emberConfig.emberAdapterPackageId!);
  expect(refresh.typeArguments).toEqual([config.underlyingTypeTag, emberConfig.emberReceiptTypeTag!, config.syTypeTag, config.ptTypeTag, config.ytTypeTag]);
  expect(refresh.index).toBeGreaterThan(calls.find(c => c.function === 'initialize_pool_by_admin')!.index);
  expect(calls.some(c => c.function === 'redeem_shares' || /haedal|scallop/.test(c.module))).toBe(false);
});

test('points-first initialization settles pre/post YT, LP and pool scopes before retaining the position', () => {
  for (const base of [config, haedalConfig, emberConfig]) {
    const c = {...base, jitterExtensionsPackageId: id(76), liquidlink: points};
    const client = JitterClient.fromConfig('mainnet', c);
    const tx = base.adapterKind === 'ember' ? client.buildInitializeEmberLiquidityTx(input) : base.adapterKind === 'haedal' ? client.buildInitializeHaedalLiquidityTx(input) : client.buildInitializeScallopLiquidityTx(input);
    const commands = tx.getData().commands;
    const calls = commands.flatMap((c, index) => c.MoveCall ? [{...c.MoveCall, index}] : []);
    const init = calls.find(c => c.function === 'initialize_pool_by_admin')!;
    for (const arg of init.arguments.slice(0, 2)) {
      if (arg.$kind !== 'Result') throw Error('Expected settlement vector');
      expect(commands[arg.Result]!.MakeMoveVec?.elements).toHaveLength(1);
    }
    const yt = calls.filter(c => c.function === 'settle_yt_reward_operation');
    const lp = calls.filter(c => c.function === 'settle_lp_reward_operation');
    const pool = calls.filter(c => c.function === 'settle_pool_reward_operation');
    expect(yt).toHaveLength(3); expect(lp).toHaveLength(3); expect(pool).toHaveLength(2);
    expect(yt[0]!.index).toBeLessThan(calls.find(c => c.function === 'mint_py')!.index);
    expect(lp[0]!.index).toBeLessThan(init.index); expect(lp[1]!.index).toBeGreaterThan(init.index);
    expect(pool[0]!.index).toBeLessThan(init.index); expect(pool[1]!.index).toBeGreaterThan(init.index);
    expect(calls.filter(c => c.function === 'settle_stamp')).toHaveLength(6);
    expect(calls.find(c => c.function === 'transfer_position')!.index).toBeGreaterThan(lp[2]!.index);
  }
});

test('initial point registration rejects incomplete, closed or referral point topology', () => {
  for (const change of [{jitterExtensionsPackageId: undefined}, {liquidlink: {...points, lpPointStateObjectId: undefined}},
    {liquidlink: {...points, closed: true}}, {liquidlink: {...points, pointPrograms: [{label: 'bad', protocol: 'Jitter',
      projectObjectId: id(72), scoreboardObjectId: id(73), pointConfigObjectId: id(74), scopes: ['yt']}]}}]) {
    expect(() => JitterClient.fromConfig('mainnet', {...config, jitterExtensionsPackageId: id(76), liquidlink: points, ...change} as JitterMarketConfig).buildInitializeScallopLiquidityTx(input)).toThrow();
  }
});
