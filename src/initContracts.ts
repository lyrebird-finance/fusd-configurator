/* eslint-disable no-promise-executor-return */
import { tx, wallet } from '@cityofzion/neon-core';
import { config } from './config';
import { logger } from './utils/loggingUtils';
import {
  BNEO_SCRIPT_HASH,
  DapiUtils,
  BTC_SCRIPT_HASH,
  FLM_SCRIPT_HASH,
  FLUND_SCRIPT_HASH,
  FUSDT_SCRIPT_HASH,
  FUSD_SCRIPT_HASH,
  PRICE_FEED_SCRIPT_HASH,
  SWAP_FACTORY_SCRIPT_HASH,
  VAULT_SCRIPT_HASH,
} from './utils/dapiUtils';

const properties = config.getProperties();

const PRIVATE_KEY: string = properties.privateKey;
const OWNER: wallet.Account = new wallet.Account(PRIVATE_KEY);
const DRY_RUN: boolean = properties.dryRun;
const FEED_SIGNER: string = properties.feedSigner;

async function submitTransaction(
  transaction: tx.Transaction,
  description: string,
) {
  await DapiUtils.checkNetworkFee(transaction);
  await DapiUtils.checkSystemFee(transaction);
  if (DRY_RUN) {
    logger.info(`Not submitting ${description} transaction since dry run...`);
    return null;
  }
  logger.info(`Submitting ${description} transaction...`);
  return DapiUtils.performTransfer(transaction, OWNER);
}

async function priceFeedSetFlm() {
  const transaction = await DapiUtils.setFLMScriptHash(
    PRICE_FEED_SCRIPT_HASH,
    FLM_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'PriceFeed::setFlm()');
}

async function priceFeedSetFlund() {
  const transaction = await DapiUtils.setFLUNDScriptHash(
    PRICE_FEED_SCRIPT_HASH,
    FLUND_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'PriceFeed::setFlund()');
}

async function priceFeedSetPath(fromToken: string, toToken: string, path: string[]) {
  const transaction = await DapiUtils.setPath(
    fromToken,
    toToken,
    path,
    OWNER,
  );
  await submitTransaction(transaction, 'PriceFeed::setPath()');
}

async function priceFeedSetSwapFactory() {
  const transaction = await DapiUtils.setSwapFactoryScriptHash(
    SWAP_FACTORY_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'PriceFeed::setPath()');
}

async function fusdSetVault() {
  const transaction = await DapiUtils.setVaultScriptHash(
    FUSD_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'FUSD::setVaultScriptHash()');
}

async function vaultSetFLUND() {
  const transaction = await DapiUtils.setFLUNDScriptHash(
    VAULT_SCRIPT_HASH,
    FLUND_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'Vault::setFLUNDScriptHash()');
}

async function vaultSetbNEO() {
  const transaction = await DapiUtils.setbNEOScriptHash(
    BNEO_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'Vault::setbNEOScriptHash()');
}

async function vaultSetQuoteToken() {
  const transaction = await DapiUtils.setQuoteTokenHash(
    FUSDT_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'Vault::setQuoteTokenHash()');
}

async function vaultSetPriceFeed() {
  const transaction = await DapiUtils.setPriceFeedHash(
    PRICE_FEED_SCRIPT_HASH,
    OWNER,
  );
  await submitTransaction(transaction, 'Vault::setPriceFeedHash()');
}

async function vaultSupportCollateral(token: string, hash: string) {
  const transaction = await DapiUtils.supportCollateral(
    VAULT_SCRIPT_HASH,
    hash,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::supportCollateral(${token})`);
}

async function vaultSupportFToken(token: string, hash: string) {
  const transaction = await DapiUtils.supportFToken(
    VAULT_SCRIPT_HASH,
    hash,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::supportFToken(${token})`);
}

async function vaultSetSigner(signer: string) {
  const transaction = await DapiUtils.setSigner(
    VAULT_SCRIPT_HASH,
    signer,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::setSigner(${signer})`);
}

async function vaultSetGasAdmin(gasAdmin: string) {
  const transaction = await DapiUtils.setGasAdmin(
    gasAdmin,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::setGasAdmin(${gasAdmin})`);
}

async function vaultSetLrbFundAdmin(lrbFundAdmin: string) {
  const transaction = await DapiUtils.setLrbFundAdmin(
    lrbFundAdmin,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::setLrbFundAdmin(${lrbFundAdmin})`);
}

async function vaultSetSecurityFundAdmin(securityFundAdmin: string) {
  const transaction = await DapiUtils.setSecurityFundAdmin(
    securityFundAdmin,
    OWNER,
  );
  await submitTransaction(transaction, `Vault::setSecurityFundAdmin(${securityFundAdmin})`);
}

async function vaultSetLiquidationLimit(
  collateralName: string,
  collateralHash: string,
  liquidationLimit: number,
) {
  const transaction = await DapiUtils.setLiquidationLimit(collateralHash, liquidationLimit, OWNER);
  await submitTransaction(transaction, `Vault::setLiquidationLimit(${collateralName}, ${liquidationLimit})`);
}

async function vaultSetLiquidationPenalty(
  collateralName: string,
  collateralHash: string,
  liquidationPenalty: number,
) {
  const transaction = await DapiUtils.setLiquidationPenalty(collateralHash, liquidationPenalty, OWNER);
  await submitTransaction(transaction, `Vault::setLiquidationPenalty(${collateralName}, ${liquidationPenalty})`);
}

async function vaultSetLiquidationBonus(
  collateralName: string,
  collateralHash: string,
  liquidationBonus: number,
) {
  const transaction = await DapiUtils.setLiquidationBonus(collateralHash, liquidationBonus, OWNER);
  await submitTransaction(transaction, `Vault::setLiquidationBonus(${collateralName}, ${liquidationBonus})`);
}

async function vaultSetAnnualInterest(
  collateralName: string,
  collateralHash: string,
  annualInterest: number,
) {
  const transaction = await DapiUtils.setAnnualInterest(collateralHash, annualInterest, OWNER);
  await submitTransaction(transaction, `Vault::setAnnualInterest(${collateralName}, ${annualInterest})`);
}

async function vaultSetMaxLoanToValue(
  collateralName: string,
  collateralHash: string,
  maxLoanToValue: number,
) {
  const transaction = await DapiUtils.setMaxLoanToValue(collateralHash, maxLoanToValue, OWNER);
  await submitTransaction(transaction, `Vault::setMaxLoanToValue(${collateralName}, ${maxLoanToValue})`);
}

async function vaultSetMaxInitLoanToValue(
  collateralName: string,
  collateralHash: string,
  maxLoanToValue: number,
) {
  const transaction = await DapiUtils.setMaxInitLoanToValue(collateralHash, maxLoanToValue, OWNER);
  await submitTransaction(transaction, `Vault::setMaxInitLoanToValue(${collateralName}, ${maxLoanToValue})`);
}

async function initPriceFeed() {
  await priceFeedSetFlm();
  await priceFeedSetFlund();
  await priceFeedSetSwapFactory();
  // Verify these before setting
  await priceFeedSetPath(
    FUSD_SCRIPT_HASH,
    FUSDT_SCRIPT_HASH,
    [FUSD_SCRIPT_HASH, FUSDT_SCRIPT_HASH],
  );
  await priceFeedSetPath(
    BNEO_SCRIPT_HASH,
    FUSDT_SCRIPT_HASH,
    [BNEO_SCRIPT_HASH, FUSDT_SCRIPT_HASH],
  );
  await priceFeedSetPath(
    BTC_SCRIPT_HASH,
    FUSDT_SCRIPT_HASH,
    [BTC_SCRIPT_HASH, FUSDT_SCRIPT_HASH],
  );
  await priceFeedSetPath(
    FLM_SCRIPT_HASH,
    FUSDT_SCRIPT_HASH,
    [FLM_SCRIPT_HASH, FUSDT_SCRIPT_HASH],
  );

  if (!DRY_RUN) {
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }

  logger.info('PriceFeed::Validating FLM...');
  const flmHash = await DapiUtils.getFlmHash(PRICE_FEED_SCRIPT_HASH);
  logger.info(`PriceFeed::Factory=${flmHash}`);

  logger.info('PriceFeed::Validating FLUND...');
  const flundHash = await DapiUtils.getFlundHash(PRICE_FEED_SCRIPT_HASH);
  logger.info(`PriceFeed::Factory=${flundHash}`);

  logger.info('PriceFeed::Validating FlamingoSwapFactory...');
  const factory = await DapiUtils.getSwapFactoryScriptHash();
  logger.info(`PriceFeed::Factory=${factory}`);

  logger.info('PriceFeed::Validating BNEO-fUSDT path...');
  let path = await DapiUtils.getPath(BNEO_SCRIPT_HASH, FUSDT_SCRIPT_HASH);
  logger.info(`PriceFeed::bNEO-fUSDT Path=${path}`);

  logger.info('PriceFeed::Validating fWBTC-fUSDT path...');
  path = await DapiUtils.getPath(BTC_SCRIPT_HASH, FUSDT_SCRIPT_HASH);
  logger.info(`PriceFeed::fWBTC-fUSDT Path=${path}`);

  logger.info('PriceFeed::Validating FLM-fUSDT path...');
  path = await DapiUtils.getPath(FLM_SCRIPT_HASH, FUSDT_SCRIPT_HASH);
  logger.info(`PriceFeed::FLM-fUSDT Path=${path}`);

  logger.info('PriceFeed::Validating FUSD-fUSDT path...');
  path = await DapiUtils.getPath(FUSD_SCRIPT_HASH, FUSDT_SCRIPT_HASH);
  logger.info(`PriceFeed::FUSD-fUSDT Path=${path}`);
}

async function initFusd() {
  await fusdSetVault();

  if (!DRY_RUN) {
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }

  logger.info('FUSD::Validating Vault script hash...');
  const vaultScriptHash = await DapiUtils.getVaultScriptHash(FUSD_SCRIPT_HASH);
  logger.info(`FUSD::Vault script hash=${vaultScriptHash}`);
}

async function initVault() {
  await vaultSetFLUND();
  await vaultSetbNEO();
  await vaultSetQuoteToken();
  await vaultSetPriceFeed();
  await vaultSetSigner(FEED_SIGNER);
  await vaultSetGasAdmin(OWNER.scriptHash);
  await vaultSetLrbFundAdmin(OWNER.scriptHash);
  await vaultSetSecurityFundAdmin(OWNER.scriptHash);

  await vaultSupportCollateral('fWBTC', BTC_SCRIPT_HASH);
  await vaultSupportCollateral('bNEO', BNEO_SCRIPT_HASH);
  await vaultSupportCollateral('FLUND', FLUND_SCRIPT_HASH);
  await vaultSupportFToken('FUSD', FUSD_SCRIPT_HASH);

  // Default values are the correct values for the commented out lines

  // Max LTV before liquidation eligible
  // await vaultSetMaxLoanToValue('bNEO', BNEO_SCRIPT_HASH, 40);
  // await vaultSetMaxLoanToValue('fWBTC', BTC_SCRIPT_HASH, 40);
  // await vaultSetMaxLoanToValue('FLUND', FLUND_SCRIPT_HASH, 40);

  // Max LTV allowed at mint or withdraw
  // await vaultSetMaxInitLoanToValue('bNEO', BNEO_SCRIPT_HASH, 35);
  // await vaultSetMaxInitLoanToValue('fWBTC', BTC_SCRIPT_HASH, 35);
  // await vaultSetMaxInitLoanToValue('FLUND', FLUND_SCRIPT_HASH, 35);

  // Max % of FToken balance eligible for liquidation
  // await vaultSetLiquidationLimit('bNEO', BNEO_SCRIPT_HASH, 50);
  // await vaultSetLiquidationLimit('fWBTC', BTC_SCRIPT_HASH, 50);
  // await vaultSetLiquidationLimit('FLUND', FLUND_SCRIPT_HASH, 50);

  // % of FTokens repaid by liquidator that are not applied to the balance
  // await vaultSetLiquidationPenalty('bNEO', BNEO_SCRIPT_HASH, 8);
  // await vaultSetLiquidationPenalty('fWBTC', BTC_SCRIPT_HASH, 8);
  // await vaultSetLiquidationPenalty('FLUND', FLUND_SCRIPT_HASH, 8);

  // Additional % of collateral released to the liquidator
  await vaultSetLiquidationBonus('bNEO', BNEO_SCRIPT_HASH, 5);
  await vaultSetLiquidationBonus('fWBTC', BTC_SCRIPT_HASH, 5);
  await vaultSetLiquidationBonus('FLUND', FLUND_SCRIPT_HASH, 5);

  // getLiquidationFlundAllocation
  // getLiquidationLrbAllocation

  await vaultSetAnnualInterest('bNEO', BNEO_SCRIPT_HASH, 4);
  await vaultSetAnnualInterest('fWBTC', BTC_SCRIPT_HASH, 6);
  await vaultSetAnnualInterest('FLUND', FLUND_SCRIPT_HASH, 6);

  // getInterestFlundAllocation
  // getInterestLrbAllocation

  // getCompoundFlundAllocation

  // getMaxPriceDiff

  // getMintLimitPerBlock
  // geLiquidateLimitPerBlock

  if (!DRY_RUN) {
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }

  logger.info('Vault::Validating FLUND hash...');
  const flundHash = await DapiUtils.getFlundHash(VAULT_SCRIPT_HASH);
  logger.info(`Vault::FLUND hash=${flundHash}`);

  logger.info('Vault::Validating bNEO hash...');
  const bNEOHash = await DapiUtils.getbNEOHash(VAULT_SCRIPT_HASH);
  logger.info(`Vault::bNEO hash=${bNEOHash}`);

  logger.info('Vault::Validating quote token hash...');
  const quoteTokenHash = await DapiUtils.getQuoteTokenHash();
  logger.info(`Vault::Quote token hash=${quoteTokenHash}`);

  logger.info('Vault::Validating price feed hash...');
  const priceFeedHash = await DapiUtils.getPriceFeedHash();
  logger.info(`Vault::Price feed hash=${priceFeedHash}`);

  logger.info('Vault::Validating signer...');
  const vaultSigners = await DapiUtils.getSigners();
  logger.info(`Vault::Vault signers=${vaultSigners}`);

  logger.info('Vault::Validating GAS admin...');
  const gasAdmin = await DapiUtils.getGasAdmin();
  logger.info(`Vault::GAS admin=${gasAdmin}`);

  logger.info('Vault::Validating LRB Fund admin...');
  const lrbFundAdmin = await DapiUtils.getLrbFundAdmin();
  logger.info(`Vault::LRB Fund admin=${lrbFundAdmin}`);

  logger.info('Vault::Validating Security Fund admin...');
  const securityFundAdmin = await DapiUtils.getSecurityFundAdmin();
  logger.info(`Vault::Security Fund admin=${securityFundAdmin}`);

  logger.info('Vault::Validating supported collateral bNEO...');
  const bneoSupported = await DapiUtils.isCollateralSupported(VAULT_SCRIPT_HASH, BNEO_SCRIPT_HASH);
  logger.info(`Vault::bNEO supported collateral=${bneoSupported}`);

  logger.info('Vault::Validating supported collateral fWBTC...');
  const btcSupported = await DapiUtils.isCollateralSupported(VAULT_SCRIPT_HASH, BTC_SCRIPT_HASH);
  logger.info(`Vault::fWBTC supported collateral=${btcSupported}`);

  logger.info('Vault::Validating supported collateral FLUND...');
  const flundSupported = await DapiUtils.isCollateralSupported(VAULT_SCRIPT_HASH, FLUND_SCRIPT_HASH);
  logger.info(`Vault::FLUND supported collateral=${flundSupported}`);

  logger.info('Vault::Validating supported fToken FUSD...');
  const isFTokenSupported = await DapiUtils.isFTokenSupported(VAULT_SCRIPT_HASH, FUSD_SCRIPT_HASH);
  logger.info(`Vault::FUSD supported fToken=${isFTokenSupported}`);

  logger.info('Vault::Validating Max LTV...');
  const bneoMaxLTV = await DapiUtils.getMaxLoanToValue(BNEO_SCRIPT_HASH);
  const btcMaxLTV = await DapiUtils.getMaxLoanToValue(BTC_SCRIPT_HASH);
  const flundMaxLTV = await DapiUtils.getMaxLoanToValue(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Max LTV bNEO=${bneoMaxLTV}, fWBTC=${btcMaxLTV}, FLUND=${flundMaxLTV}`);

  logger.info('Vault::Validating Max Init LTV...');
  const bneoMaxInitLTV = await DapiUtils.getMaxInitLoanToValue(BNEO_SCRIPT_HASH);
  const btcMaxInitLTV = await DapiUtils.getMaxInitLoanToValue(BTC_SCRIPT_HASH);
  const flundMaxInitLTV = await DapiUtils.getMaxInitLoanToValue(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Max Init LTV bNEO=${bneoMaxInitLTV}, fWBTC=${btcMaxInitLTV}, FLUND=${flundMaxInitLTV}`);

  logger.info('Vault::Validating liquidation limit...');
  const bneoLiquidationLimit = await DapiUtils.getLiquidationLimit(BNEO_SCRIPT_HASH);
  const btcLiquidationLimit = await DapiUtils.getLiquidationLimit(BTC_SCRIPT_HASH);
  const flundLiquidationLimit = await DapiUtils.getLiquidationLimit(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Liquidation limit bNEO=${bneoLiquidationLimit}, fWBTC=${btcLiquidationLimit}, FLUND=${flundLiquidationLimit}`);

  logger.info('Vault::Validating liquidation penalty...');
  const bneoLiquidationPenalty = await DapiUtils.getLiquidationPenalty(BNEO_SCRIPT_HASH);
  const btcLiquidationPenalty = await DapiUtils.getLiquidationPenalty(BTC_SCRIPT_HASH);
  const flundLiquidationPenalty = await DapiUtils.getLiquidationPenalty(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Liquidation penalty bNEO=${bneoLiquidationPenalty}, fWBTC=${btcLiquidationPenalty}, FLUND=${flundLiquidationPenalty}`);

  logger.info('Vault::Validating liquidation bonus...');
  const bneoLiquidationBonus = await DapiUtils.getLiquidationBonus(BNEO_SCRIPT_HASH);
  const btcLiquidationBonus = await DapiUtils.getLiquidationBonus(BTC_SCRIPT_HASH);
  const flundLiquidationBonus = await DapiUtils.getLiquidationBonus(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Liquidation bonus bNEO=${bneoLiquidationBonus}, fWBTC=${btcLiquidationBonus}, FLUND=${flundLiquidationBonus}`);

  logger.info('Vault::Validating annual interest...');
  const bneoAnnualInterest = await DapiUtils.getAnnualInterest(BNEO_SCRIPT_HASH);
  const btcAnnualInterest = await DapiUtils.getAnnualInterest(BTC_SCRIPT_HASH);
  const flundAnnualInterest = await DapiUtils.getAnnualInterest(FLUND_SCRIPT_HASH);
  logger.info(`Vault::Annual interest bNEO=${bneoAnnualInterest}, fWBTC=${btcAnnualInterest}, FLUND=${flundAnnualInterest}`);

  logger.info('Vault::Validating mint limit...');
  const mintLimit = await DapiUtils.getMintLimitPerBlock(FUSD_SCRIPT_HASH);
  logger.info(`Vault::FUSD mint limit=${mintLimit / 10 ** 8}`);

  logger.info('Vault::Validating liquidate limit...');
  const liquidateLimit = await DapiUtils.getLiquidateLimitPerBlock(FUSD_SCRIPT_HASH);
  logger.info(`Vault::FUSD liquidate limit=${liquidateLimit / 10 ** 8}`);
}

/* async function depositCollateral(quantity: number) {
  const transaction = await DapiUtils.depositCollateral(BTC_SCRIPT_HASH, FUSD_SCRIPT_HASH, quantity, OWNER);
  await submitTransaction(transaction, 'Vault::depositCollateral(bNEO, FUSD)');
}

async function withdrawCollateral(quantity: number) {
  const transaction = await DapiUtils.withdrawCollateral(BTC_SCRIPT_HASH, FUSD_SCRIPT_HASH, quantity, OWNER);
  await submitTransaction(transaction, 'Vault::withdrawCollateral(bNEO, FUSD)');
}

async function mintFUSD(quantity: number) {
  const transaction = await DapiUtils.mintFToken(BTC_SCRIPT_HASH, FUSD_SCRIPT_HASH, quantity, OWNER);
  await submitTransaction(transaction, 'Vault::mintFToken(bNEO, FUSD)');
}

async function repayFUSD(quantity: number) {
  const transaction = await DapiUtils.repayFToken(BTC_SCRIPT_HASH, FUSD_SCRIPT_HASH, quantity, OWNER);
  await submitTransaction(transaction, 'Vault::repayFToken(bNEO, FUSD)');
} */

(async () => {
  await initFusd();
  await initVault();
  await initPriceFeed();
})();
