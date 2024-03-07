import { Flags } from '@oclif/core';

export const privateKey = Flags.string({
  description: 'Account private key',
  env: 'HYPERPLAY_PRIVATE_KEY',
  default: '',
});

export const network = Flags.string({
  description: 'Blockchain network',
  env: 'HYPERPLAY_NETWORK',
  default: 'https://rpc.valist.io',
  parse: parseNetwork,
});

export const metaTx = Flags.boolean({
  description: 'Enable meta transactions',
  allowNo: true,
  default: true,
});

export const release = Flags.string({
  description: 'Release name/version',
  env: 'HYPERPLAY_RELEASE',
  default: '',
});

async function parseNetwork(network: string) {
  switch (network) {
    case 'polygon':
      return 'https://rpc.valist.io/polygon';
    case 'mumbai':
      return 'https://rpc.valist.io/mumbai';
    default:
      return network;
  }
}