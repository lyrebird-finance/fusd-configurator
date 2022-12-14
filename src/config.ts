import dotenv from 'dotenv';
import convict from 'convict';

dotenv.config();

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['prod', 'test'],
    default: 'test',
    arg: 'nodeEnv',
    env: 'NODE_ENV',
    privateKey: process.env.PRIVATE_KEY,
  },
  privateKey: {
    format: String,
    default: '',
    arg: 'privateKey',
    env: 'PRIVATE_KEY',
  },
  rpcNodeUrl: {
    format: String,
    default: '',
    arg: 'rpcNodeUrl',
    env: 'RPC_NODE_URL',
  },
  networkMagic: {
    format: Number,
    default: 0,
    arg: 'networkMagic',
    env: 'NETWORK_MAGIC',
  },
  flundScriptHash: {
    format: String,
    default: '',
    arg: 'flundScriptHash',
    env: 'FLUND_SCRIPT_HASH',
  },
  fusdScriptHash: {
    format: String,
    default: '',
    arg: 'fusdScriptHash',
    env: 'FUSD_SCRIPT_HASH',
  },
  vaultScriptHash: {
    format: String,
    default: '',
    arg: 'vaultScriptHash',
    env: 'VAULT_SCRIPT_HASH',
  },
  priceFeedScriptHash: {
    format: String,
    default: '',
    arg: 'priceFeedScriptHash',
    env: 'PRICE_FEED_SCRIPT_HASH',
  },
  bneoScriptHash: {
    format: String,
    default: '',
    arg: 'bneoScriptHash',
    env: 'BNEO_SCRIPT_HASH',
  },
  btcScriptHash: {
    format: String,
    default: '',
    arg: 'btcScriptHash',
    env: 'BTC_SCRIPT_HASH',
  },
  flmScriptHash: {
    format: String,
    default: '',
    arg: 'flmScriptHash',
    env: 'FLM_SCRIPT_HASH',
  },
  fusdtScriptHash: {
    format: String,
    default: '',
    arg: 'fusdtScriptHash',
    env: 'FUSDT_SCRIPT_HASH',
  },
  swapFactoryScriptHash: {
    format: String,
    default: '',
    arg: 'swapFactoryScriptHash',
    env: 'SWAP_FACTORY_SCRIPT_HASH',
  },
  feedSigner: {
    format: String,
    default: '',
    arg: 'feedSigner',
    env: 'FEED_SIGNER',
  },
  dryRun: {
    format: Boolean,
    default: true,
    arg: 'dryRun',
    env: 'DRY_RUN',
  },
});

const env = config.get('env');
config.loadFile(`./config/${env}.json`);
config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

// eslint-disable-next-line import/prefer-default-export
export { config };
