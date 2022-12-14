import { StackItemJson } from '@cityofzion/neon-core/lib/sc';
import {
  sc, rpc, tx, wallet, u, CONST,
} from '@cityofzion/neon-core';
import axios from 'axios';
import { config } from '../config';
import { logger } from './loggingUtils';

const properties = config.getProperties();

export type Account = {
  address: string,
};

export type AccountQuantity = {
  address: string,
  quantity: number,
};

// Network node
const RPC_NODE_URL: string = properties.rpcNodeUrl;
const RPC_CLIENT = new rpc.RPCClient(RPC_NODE_URL);
const NETWORK_MAGIC = properties.networkMagic;

// Script hashes
export const FUSD_SCRIPT_HASH: string = properties.fusdScriptHash;
export const VAULT_SCRIPT_HASH: string = properties.vaultScriptHash;
export const PRICE_FEED_SCRIPT_HASH: string = properties.priceFeedScriptHash;

export const BNEO_SCRIPT_HASH: string = properties.bneoScriptHash;
export const BTC_SCRIPT_HASH: string = properties.btcScriptHash;
export const FLM_SCRIPT_HASH: string = properties.flmScriptHash;
export const FLUND_SCRIPT_HASH: string = properties.flundScriptHash;
export const FUSDT_SCRIPT_HASH: string = properties.fusdtScriptHash;
export const SWAP_FACTORY_SCRIPT_HASH: string = properties.swapFactoryScriptHash;

export async function getPriceFeed() {
  return axios.get('https://api.flamingo.finance/token-info/test-signed-prices?fusd=100000000000000000000&bneo=1400000000000000000000').then((ret) => ret.data);
}

// Entry point for all read operations
export async function genericReadCall(scriptHash: string, operation: string, args: any[]) {
  const result = await RPC_CLIENT.invokeFunction(scriptHash, operation, args);
  const retVal = result.stack[0].value;
  return retVal;
}

export async function getTime() {
  return genericReadCall(VAULT_SCRIPT_HASH, 'getTime', [
  ]).then((ret) => parseInt(ret as unknown as string, 10));
}

export async function getPriceExpiry(collateralHash: string, fTokenHash: string, account: string) {
  return genericReadCall(VAULT_SCRIPT_HASH, 'getPriceExpiry', [
    sc.ContractParam.hash160(collateralHash),
    sc.ContractParam.hash160(fTokenHash),
    sc.ContractParam.hash160(account),
  ]).then((ret) => parseInt(ret as unknown as string, 10));
}

export async function getDecimal0(contractHash: string) {
  return genericReadCall(contractHash, 'getToken0', []).then((ret) => {
    const tokenHash = u.HexString.fromBase64(ret as string).toLittleEndian();
    return genericReadCall(tokenHash, 'decimals', [])
      .then((innerRet) => parseInt(innerRet as string, 10));
  });
}

export async function getDecimal1(contractHash: string) {
  return genericReadCall(contractHash, 'getToken1', []).then((ret) => {
    const tokenHash = u.HexString.fromBase64(ret as string).toLittleEndian();
    return genericReadCall(tokenHash, 'decimals', [])
      .then((innerRet) => parseInt(innerRet as string, 10));
  });
}

export async function getToken0(contractHash: string) {
  return genericReadCall(contractHash, 'getToken0', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getToken1(contractHash: string) {
  return genericReadCall(contractHash, 'getToken1', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getExchangePair(contractHash: string, token1: string, token2: string) {
  const params = [
    sc.ContractParam.hash160(token1),
    sc.ContractParam.hash160(token2),
  ];
  return genericReadCall(contractHash, 'getExchangePair', params)
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getPoolReserves(contractHash: string) {
  return genericReadCall(contractHash, 'getReserves', []).then((ret) => ret as unknown as StackItemJson[]);
}

export async function getBalance(contractHash: string, account: string) {
  return genericReadCall(
    contractHash,
    'balanceOf',
    [sc.ContractParam.hash160(account)],
  ).then((ret) => parseInt(ret as unknown as string, 10));
}

export async function totalSupply(contractHash: string) {
  return genericReadCall(
    contractHash,
    'totalSupply',
    [],
  ).then((ret) => parseInt(ret as unknown as string, 10));
}

export async function getVaultScriptHash(scriptHash: string) {
  return genericReadCall(scriptHash, 'getVaultScriptHash', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getSwapFactoryScriptHash() {
  return genericReadCall(PRICE_FEED_SCRIPT_HASH, 'getSwapFactoryHash', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

// Entry point for all write operations
async function createTransaction(
  contractHash: string,
  operation: string,
  params: sc.ContractParam[],
  account: wallet.Account,
) {
  const script = sc.createScript({
    scriptHash: contractHash,
    operation,
    args: params,
  });

  const currentHeight = await RPC_CLIENT.getBlockCount();
  const transaction = new tx.Transaction({
    signers: [
      {
        account: account.scriptHash,
        scopes: tx.WitnessScope.CalledByEntry,
      },
    ],
    validUntilBlock: currentHeight + 10,
    script,
  });
  logger.debug(`Transaction created: contractHash=${contractHash}, operation=${operation}, `
    + `params=${JSON.stringify(params)}, account=${account.address}`);
  return transaction;
}

export async function transfer(
  contractHash: string,
  quantity: number,
  toAddress: string,
  account: wallet.Account,
) {
  return createTransaction(
    contractHash,
    'transfer',
    [
      sc.ContractParam.hash160(account.address),
      sc.ContractParam.hash160(toAddress),
      sc.ContractParam.integer(quantity * 100_000_000),
      sc.ContractParam.array(...[]),
    ],
    account,
  );
}

export async function genericSetHash(
  scriptHash: string,
  targetScriptHash: string,
  operation: string,
  account: wallet.Account,
) {
  return createTransaction(
    scriptHash,
    operation,
    [sc.ContractParam.hash160(targetScriptHash)],
    account,
  );
}

export async function setbNEOScriptHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(VAULT_SCRIPT_HASH, contractHash, 'setbNEOHash', account);
}

export async function setFLMScriptHash(
  contractHash: string,
  flmHash: string,
  account: wallet.Account,
) {
  return genericSetHash(contractHash, flmHash, 'setFLMHash', account);
}

export async function setFLUNDScriptHash(
  contractHash: string,
  flundHash: string,
  account: wallet.Account,
) {
  return genericSetHash(contractHash, flundHash, 'setFLUNDHash', account);
}

export async function setLRBFundScriptHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(VAULT_SCRIPT_HASH, contractHash, 'setLRBFundHash', account);
}

export async function setVaultScriptHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(contractHash, VAULT_SCRIPT_HASH, 'setVaultScriptHash', account);
}

export async function setQuoteTokenHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(VAULT_SCRIPT_HASH, contractHash, 'setQuoteTokenHash', account);
}

export async function setPriceFeedHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(VAULT_SCRIPT_HASH, contractHash, 'setPriceFeedHash', account);
}

export async function setSwapFactoryScriptHash(contractHash: string, account: wallet.Account) {
  return genericSetHash(PRICE_FEED_SCRIPT_HASH, contractHash, 'setSwapFactoryHash', account);
}

export async function setLiquidationLimit(
  collateralHash: string,
  liquidationLimit: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setLiquidationLimit',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(liquidationLimit),
    ],
    account,
  );
}

export async function setLiquidationPenalty(
  collateralHash: string,
  liquidationPenalty: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setLiquidationPenalty',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(liquidationPenalty),
    ],
    account,
  );
}

export async function setLiquidationBonus(
  collateralHash: string,
  liquidationBonus: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setLiquidationBonus',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(liquidationBonus),
    ],
    account,
  );
}

export async function setAnnualInterest(
  collateralHash: string,
  annualInterest: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setAnnualInterest',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(annualInterest),
    ],
    account,
  );
}

export async function setMaxLoanToValue(
  collateralHash: string,
  maxLoanToValue: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setMaxLoanToValue',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(maxLoanToValue),
    ],
    account,
  );
}

export async function setMaxInitLoanToValue(
  collateralHash: string,
  maxInitLoanToValue: number,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setMaxInitLoanToValue',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.integer(maxInitLoanToValue),
    ],
    account,
  );
}

export async function setSigner(scriptHash: string, signer: string, account: wallet.Account) {
  return createTransaction(
    scriptHash,
    'setSigner',
    [sc.ContractParam.publicKey(signer)],
    account,
  );
}

export async function setGasAdmin(gasAdmin: string, account: wallet.Account) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setGasAdmin',
    [sc.ContractParam.hash160(gasAdmin)],
    account,
  );
}

export async function setLrbFundAdmin(lrbFundAdmin: string, account: wallet.Account) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setLRBFundAdmin',
    [sc.ContractParam.hash160(lrbFundAdmin)],
    account,
  );
}

export async function setSecurityFundAdmin(securityFundAdmin: string, account: wallet.Account) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'setSecurityFundAdmin',
    [sc.ContractParam.hash160(securityFundAdmin)],
    account,
  );
}

export async function supportCollateral(
  scriptHash: string,
  tokenHash: string,
  account: wallet.Account,
) {
  return genericSetHash(scriptHash, tokenHash, 'supportCollateral', account);
}

export async function supportFToken(
  scriptHash: string,
  tokenHash: string,
  account: wallet.Account,
) {
  return genericSetHash(scriptHash, tokenHash, 'supportFToken', account);
}

export async function getQuoteTokenHash() {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getQuoteTokenHash',
    [],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

function castSigners(ret: any) {
  const retList = ret as any as StackItemJson[];
  return retList.map((e) => {
    const eVal = e as any as { value: string };
    return u.HexString.fromBase64(eVal.value).toLittleEndian();
  });
}

export async function getSigners() {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getSigners',
    [],
  ).then((ret) => castSigners(ret));
}

export async function getPriceFeedHash() {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getPriceFeedHash',
    [],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getOnChainPrice(tokenHash: string, decimals: number) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getOnChainPrice',
    [
      sc.ContractParam.hash160(tokenHash),
      sc.ContractParam.integer(decimals),
    ],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function isCollateralSupported(scriptHash: string, tokenHash: string) {
  return genericReadCall(
    scriptHash,
    'isCollateralSupported',
    [sc.ContractParam.hash160(tokenHash)],
  );
}

export async function isFTokenSupported(scriptHash: string, tokenHash: string) {
  return genericReadCall(
    scriptHash,
    'isFTokenSupported',
    [sc.ContractParam.hash160(tokenHash)],
  );
}

export async function getMaxLoanToValue(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getMaxLoanToValue',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getMaxInitLoanToValue(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getMaxInitLoanToValue',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getLiquidationLimit(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getLiquidationLimit',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getLiquidationPenalty(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getLiquidationPenalty',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getLiquidationBonus(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getLiquidationBonus',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getAnnualInterest(collateralHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getAnnualInterest',
    [sc.ContractParam.hash160(collateralHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getMintLimitPerBlock(fTokenHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getMintLimitPerBlock',
    [sc.ContractParam.hash160(fTokenHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getLiquidateLimitPerBlock(fTokenHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getLiquidateLimitPerBlock',
    [sc.ContractParam.hash160(fTokenHash)],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function depositCollateral(
  collateralHash: string,
  fTokenHash: string,
  depositQuantity: number,
  account: wallet.Account,
) {
  return createTransaction(
    collateralHash,
    'transfer',
    [
      sc.ContractParam.hash160(account.scriptHash),
      sc.ContractParam.hash160(VAULT_SCRIPT_HASH),
      sc.ContractParam.integer(depositQuantity),
      sc.ContractParam.array(...[
        sc.ContractParam.string('DEPOSIT'),
        sc.ContractParam.hash160(fTokenHash),
      ]),
    ],
    account,
  );
}

export async function withdrawCollateral(
  collateralHash: string,
  fTokenHash: string,
  withdrawQuantity: number,
  account: wallet.Account,
) {
  const priceFeed = await getPriceFeed();
  const priceJson = priceFeed.payload;
  const { signature } = priceFeed;
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'withdrawCollateral',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.hash160(fTokenHash),
      sc.ContractParam.hash160(account.scriptHash),
      sc.ContractParam.integer(withdrawQuantity),
      sc.ContractParam.string(priceJson),
      sc.ContractParam.string(signature),
    ],
    account,
  );
}

export async function mintFToken(
  collateralHash: string,
  fTokenHash: string,
  mintQuantity: number,
  account: wallet.Account,
) {
  const priceFeed = await getPriceFeed();
  const priceJson = priceFeed.payload;
  const { signature } = priceFeed;
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'mintFToken',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.hash160(fTokenHash),
      sc.ContractParam.hash160(account.scriptHash),
      sc.ContractParam.integer(mintQuantity),
      sc.ContractParam.string(priceJson),
      sc.ContractParam.string(signature),
    ],
    account,
  );
}

export async function repayFToken(
  collateralHash: string,
  fTokenHash: string,
  repayQuantity: number,
  account: wallet.Account,
) {
  return createTransaction(
    fTokenHash,
    'transfer',
    [
      sc.ContractParam.hash160(account.scriptHash),
      sc.ContractParam.hash160(VAULT_SCRIPT_HASH),
      sc.ContractParam.integer(repayQuantity),
      sc.ContractParam.array(...[
        sc.ContractParam.string('REPAY'),
        sc.ContractParam.hash160(collateralHash),
      ]),
    ],
    account,
  );
}

export async function whitelistLiquidator(
  liquidatorHash: string,
  account: wallet.Account,
) {
  return createTransaction(
    VAULT_SCRIPT_HASH,
    'whitelistLiquidator',
    [
      sc.ContractParam.hash160(liquidatorHash),
    ],
    account,
  );
}

export async function getVaultBalance(collateralHash: string, fTokenHash: string, address: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getVaultBalance',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.hash160(fTokenHash),
      sc.ContractParam.hash160(address),
    ],
  );
}

interface VaultBalance {
  collateralHash: string;
  fTokenHash: string;
  collateralBalance: number;
  fTokenBalance: number;
}

function castVaultBalances(ret: any) {
  const retList = ret as any as StackItemJson[];
  return retList.map((e) => {
    const eVal = e as any as { value: { value: string }[] };
    return {
      collateralHash:
        u.HexString.fromBase64(eVal.value[0].value).toLittleEndian(),
      fTokenHash:
        u.HexString.fromBase64(eVal.value[1].value).toLittleEndian(),
      collateralBalance: parseInt(eVal.value[2].value, 10),
      fTokenBalance: parseInt(eVal.value[3].value, 10),
    } as VaultBalance;
  });
}

export async function getVaultBalances(address: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getVaultBalances',
    [
      sc.ContractParam.hash160(address),
    ],
  ).then((ret) => castVaultBalances(ret));
}

export interface AccountVaultBalance {
  account: string;
  collateralBalance: number;
  fTokenBalance: number;
}

function castAccountVaultBalances(ret: any) {
  const retList = ret as any as StackItemJson[];
  return retList.map((e) => {
    const eVal = e as any as { value: { value: string }[] };
    return {
      account:
        u.HexString.fromBase64(eVal.value[0].value).toLittleEndian(),
      collateralBalance: parseInt(eVal.value[1].value, 10),
      fTokenBalance: parseInt(eVal.value[2].value, 10),
    } as AccountVaultBalance;
  });
}

export async function getAllVaults(
  collateralHash: string,
  fTokenHash: string,
  pageSize: number,
  pageNum: number,
) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getAllVaults',
    [
      sc.ContractParam.hash160(collateralHash),
      sc.ContractParam.hash160(fTokenHash),
      sc.ContractParam.integer(pageSize),
      sc.ContractParam.integer(pageNum),
    ],
  ).then((ret) => castAccountVaultBalances(ret));
}

export async function isPaused() {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'isPaused',
    [],
  );
}

export async function getInterestMultiplier(tokenHash: string) {
  return genericReadCall(
    VAULT_SCRIPT_HASH,
    'getInterestMultiplier',
    [
      sc.ContractParam.hash160(tokenHash),
    ],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function setPath(
  fromToken: string,
  toToken: string,
  path: string[],
  account: wallet.Account,
) {
  const pathParam = path.map(
    (stop) => sc.ContractParam.hash160(stop) as sc.ContractParamLike,
  );
  return createTransaction(
    PRICE_FEED_SCRIPT_HASH,
    'setPath',
    [
      sc.ContractParam.hash160(fromToken),
      sc.ContractParam.hash160(toToken),
      sc.ContractParam.array(...pathParam),
    ],
    account,
  );
}

function castPath(ret: any) {
  const retList = ret as any as StackItemJson[];
  return retList.map((e) => {
    const eVal = e as any;
    return u.HexString.fromBase64(eVal.value).toLittleEndian();
  });
}

function castRatio(ret: any) {
  const retList = ret as any as StackItemJson[];
  return retList.map((e) => {
    const eVal = e as any;
    return parseInt(eVal.value, 10);
  });
}

export async function getPath(fromToken: string, toToken: string) {
  return genericReadCall(
    PRICE_FEED_SCRIPT_HASH,
    'getPath',
    [
      sc.ContractParam.hash160(fromToken),
      sc.ContractParam.hash160(toToken),
    ],
  ).then((ret) => castPath(ret));
}

export async function getSwapPair(tokenA: string, tokenB: string) {
  return genericReadCall(
    PRICE_FEED_SCRIPT_HASH,
    'getSwapPair',
    [
      sc.ContractParam.hash160(tokenA),
      sc.ContractParam.hash160(tokenB),
    ],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getRatio(fromToken: string, toToken: string) {
  return genericReadCall(
    PRICE_FEED_SCRIPT_HASH,
    'getRatio',
    [
      sc.ContractParam.hash160(fromToken),
      sc.ContractParam.hash160(toToken),
    ],
  ).then((ret) => castRatio(ret));
}

export async function getDecimals(contractHash: string) {
  return genericReadCall(
    contractHash,
    'decimals',
    [],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getbNEOHash(contractHash: string) {
  return genericReadCall(
    contractHash,
    'getbNEOHash',
    [],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getFlmHash(contractHash: string) {
  return genericReadCall(
    contractHash,
    'getFLMHash',
    [],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getFlundHash(contractHash: string) {
  return genericReadCall(
    contractHash,
    'getFLUNDHash',
    [],
  ).then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getFlundFlmRatio() {
  return genericReadCall(
    PRICE_FEED_SCRIPT_HASH,
    'getFlundFlmRatio',
    [],
  ).then((ret) => castRatio(ret));
}

export async function getPrice(baseToken: string, quoteToken: string, decimals: number) {
  return genericReadCall(
    PRICE_FEED_SCRIPT_HASH,
    'getPrice',
    [
      sc.ContractParam.hash160(baseToken),
      sc.ContractParam.hash160(quoteToken),
      sc.ContractParam.integer(decimals),
    ],
  ).then((ret) => parseInt(ret as string, 10));
}

export async function getOwner(scriptHash: string) {
  return genericReadCall(scriptHash, 'getOwner', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getGasAdmin() {
  return genericReadCall(VAULT_SCRIPT_HASH, 'getGasAdmin', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getLrbFundAdmin() {
  return genericReadCall(VAULT_SCRIPT_HASH, 'getLRBFundAdmin', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function getSecurityFundAdmin() {
  return genericReadCall(VAULT_SCRIPT_HASH, 'getSecurityFundAdmin', [])
    .then((ret) => u.HexString.fromBase64(ret as string).toLittleEndian());
}

export async function checkNetworkFee(transaction: tx.Transaction) {
  const feePerByteInvokeResponse = await RPC_CLIENT.invokeFunction(
    CONST.NATIVE_CONTRACT_HASH.PolicyContract,
    'getFeePerByte',
  );

  if (feePerByteInvokeResponse.state !== 'HALT') {
    throw new Error('Unable to retrieve data to calculate network fee.');
  }
  const feePerByte = u.BigInteger.fromNumber(
    feePerByteInvokeResponse.stack[0].value as any as string,
  );
  // Account for witness size
  const transactionByteSize = transaction.serialize().length / 2 + 109;
  // Hardcoded. Running a witness is always the same cost for the basic account.
  const witnessProcessingFee = u.BigInteger.fromNumber(1000390);
  const networkFeeEstimate = feePerByte
    .mul(transactionByteSize)
    .add(witnessProcessingFee);
  // eslint-disable-next-line no-param-reassign
  transaction.networkFee = networkFeeEstimate;
  logger.debug(`Network Fee set: ${transaction.networkFee.toDecimal(8)}`);
}

export async function checkSystemFee(transaction: tx.Transaction) {
  const invokeFunctionResponse = await RPC_CLIENT.invokeScript(
    u.HexString.fromHex(transaction.script),
    transaction.signers,
  );
  if (invokeFunctionResponse.state !== 'HALT') {
    throw new Error(
      `Transfer script errored out: ${invokeFunctionResponse.exception}`,
    );
  }
  const requiredSystemFee = u.BigInteger.fromNumber(
    invokeFunctionResponse.gasconsumed,
  );
  // eslint-disable-next-line no-param-reassign
  transaction.systemFee = requiredSystemFee;
  logger.debug(`System Fee set: ${transaction.systemFee.toDecimal(8)}`);
}

export async function performTransfer(transaction: tx.Transaction, account: wallet.Account) {
  const signedTransaction = transaction.sign(
    account,
    NETWORK_MAGIC,
  );

  const result = await RPC_CLIENT.sendRawTransaction(
    u.HexString.fromHex(signedTransaction.serialize(true)),
  );
  logger.info(`Transaction hash: ${result}`);
  return result;
}

export function base64MatchesAddress(base64Hash: string, address: string) {
  const fromBase64 = u.HexString.fromBase64(base64Hash, true).toString();
  const fromAddress = wallet.getScriptHashFromAddress(address);
  return fromBase64 === fromAddress;
}

// eslint-disable-next-line import/no-self-import
export * as DapiUtils from './dapiUtils';
