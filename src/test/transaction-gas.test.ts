import {expect,spyOn,test} from 'bun:test';
import {Transaction} from '@mysten/sui/transactions';
import {buildWithGasHeadroom,gasBudgetWithHeadroom} from '../services/transaction-gas.js';

test('headroom is exact, rounds up and rejects zero/overflow estimates',()=>{
  expect(gasBudgetWithHeadroom(9_759_582n)).toBe(11_711_499n);
  expect(gasBudgetWithHeadroom(1n)).toBe(2n);
  for(const amount of [0n,-1n,1n<<64n,(1n<<64n)-1n])expect(()=>gasBudgetWithHeadroom(amount)).toThrow();
});

test('automatic headroom is applied once and returns bytes built at that budget',async()=>{
  const tx=new Transaction();tx.setSender('0x1');
  tx.moveCall({target:'0x2::clock::timestamp_ms',arguments:[tx.object.clock()]});
  const intent=tx.getData();
  const build=spyOn(tx,'build').mockImplementation(async()=>{
    if(tx.getData().gasData.budget==null)tx.setGasBudget(100n);
    return Uint8Array.of(Number(tx.getData().gasData.budget));
  });
  try{
    expect(await buildWithGasHeadroom(tx)).toEqual(Uint8Array.of(120));
    expect(await buildWithGasHeadroom(tx)).toEqual(Uint8Array.of(120));
    expect(build).toHaveBeenCalledTimes(3);
    expect(tx.getData()).toEqual({...intent,gasData:{...intent.gasData,budget:'120'}});
  }finally{build.mockRestore();}
});

test('explicit budgets, including insufficient budgets, are never raised',async()=>{
  const tx=new Transaction();tx.setGasBudget(1n);
  const build=spyOn(tx,'build').mockRejectedValue(new Error('InsufficientGas'));
  try{
    await expect(buildWithGasHeadroom(tx)).rejects.toThrow('InsufficientGas');
    expect(tx.getData().gasData.budget).toBe('1');
    expect(build).toHaveBeenCalledTimes(1);
  }finally{build.mockRestore();}
});

test('missing estimates, kind-only builds and failed final checks fail closed without retry',async()=>{
  const tx=new Transaction();
  const build=spyOn(tx,'build').mockResolvedValue(new Uint8Array());
  try{
    await expect(buildWithGasHeadroom(tx,{onlyTransactionKind:true})).rejects.toThrow('complete transaction');
    expect(build).not.toHaveBeenCalled();
    await expect(buildWithGasHeadroom(tx)).rejects.toThrow('unavailable');
    let calls=0;
    build.mockImplementation(async()=>{
      if(++calls===1){tx.setGasBudget(100n);return new Uint8Array();}
      throw new Error('withdraw quota changed');
    });
    await expect(buildWithGasHeadroom(tx)).rejects.toThrow('withdraw quota changed');
    expect(calls).toBe(2);
  }finally{build.mockRestore();}
});
