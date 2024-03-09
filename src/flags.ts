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

export const web = Flags.string({
  description: 'Path to web build',
  env: 'HYPERPLAY_WEB_BUILD',
  default: ''
});

export const darwin_amd64 = Flags.string({
  description: 'Path to darwin amd64 build',
  env: 'HYPERPLAY_DARWIN_AMD64_BUILD',
  default: ''
});

export const darwin_arm64 = Flags.string({
  description: 'Path to darwin arm64 build',
  env: 'HYPERPLAY_DARWIN_ARM64_BUILD',
  default: ''
});

export const windows_arm64 = Flags.string({
  description: 'Path to windows arm64 build',
  env: 'HYPERPLAY_WINDOWS_AMD64_BUILD',
  default: ''
});

export const windows_amd64 = Flags.string({
  description: 'Path to windows amd64 build',
  env: 'HYPERPLAY_WINDOWS_AMD64_BUILD',
  default: ''
});

export const linux_amd64 = Flags.string({
  description: 'Path to linux amd64 build',
  env: 'HYPERPLAY_LINUX_AMD64_BUILD',
  default: ''
});

export const linux_arm64 = Flags.string({
  description: 'Path to linux amd64 build',
  env: 'HYPERPLAY_LINUX_AMD64_BUILD',
  default: ''
});

export const android_arm64 = Flags.string({
  description: 'Path to android arm64 build',
  env: 'HYPERPLAY_ANDROID_AMD64_BUILD',
  default: ''
});

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
