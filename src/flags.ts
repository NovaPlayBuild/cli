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

export const skip_hyperplay_publish = Flags.boolean({
  description: 'Do not publish to HyperPlay. Only Valist.',
  allowNo: true,
  default: false,
  env: 'HYPERPLAY_SKIP_HYPERPLAY_PUBLISH'
});

export const channel = Flags.string({
  description: 'Publish build to this release channel on HyperPlay.',
  default: 'main',
  env: 'HYPERPLAY_TARGET_CHANNEL'
});

export const useYml = Flags.boolean({
  description: 'Use hyperplay.yml to get platform config',
  default: false,
  env: 'HYPERPLAY_USE_YML'
})

export const ymlPath = Flags.string({
  description: 'Path to yml file containing publish args',
  default: '',
  env: 'HYPERPLAY_YML_PATH'
})
