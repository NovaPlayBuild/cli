import { Command, CliUx } from '@oclif/core';
import { ethers } from 'ethers';
import { create, ReleaseConfig, SupportedPlatform } from '@valist/sdk';
import YAML from 'yaml';
import * as fs from 'node:fs';
import * as flags from '../flags';
import { select } from '../keys';
import { CookieJar } from 'tough-cookie';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { loginAndPublish } from '../api';
import { uploadRelease } from '../releases';

export default class Publish extends Command {
  static provider?: ethers.Signer;
  static cookieJar?: CookieJar

  static description = 'Publish a release'

  static examples = [
    '<%= config.bin %> <%= command.id %> ipfs/go-ipfs/v0.12.3 README.md',
    '<%= config.bin %> <%= command.id %> ipfs/go-ipfs/v0.12.3 dist/',
  ]

  static flags = {
    'meta-tx': flags.metaTx,
    'network': flags.network,
    'private-key': flags.privateKey,
    'web': flags.web,
    'darwin_amd64': flags.darwin_amd64,
    'darwin_arm64': flags.darwin_arm64,
    'windows_amd64': flags.windows_amd64
  }

  static args = [
    {
      name: 'account',
      description: 'account name',
      required: false
    },
    {
      name: 'project',
      description: 'project name',
      required: false
    },
    {
      name: 'release',
      description: 'release name',
      required: false
    }
  ]

  async provider(network: string, privateKey: string): Promise<ethers.Signer> {
    if (Publish.provider) return Publish.provider;

    const provider = new ethers.providers.JsonRpcProvider(network);
    return new ethers.Wallet(privateKey, provider);
  }

  async parseConfig(){
    // ts having issues passing these as args so duplicating the parse here
    const { args, flags } = await this.parse(Publish);

    let config: ReleaseConfig;
    if (args.account && args.project && args.release) {
      config = new ReleaseConfig(args.account, args.project, args.release);
      const platformFlags: SupportedPlatform[] = ["web", "darwin_amd64", "darwin_arm64", "linux_amd64", "linux_arm64", "windows_amd64", "windows_arm64", "android_arm64"]
      for (const platform of platformFlags){
        if (flags[platform])
          config.platforms[platform] = flags[platform]
      }
      
    } else if(fs.existsSync('hyperplay.yml')){
      const data = fs.readFileSync('hyperplay.yml', 'utf8');
      config = YAML.parse(data);
    }
    else {
      this.error('Account, project, and release were not supplied and hyperplay.yml does not exist')
    }

    if (!config.account) this.error('invalid account name');
    if (!config.project) this.error('invalid project name');
    if (!config.release) this.error('invalid release name');
    if (!config.platforms) this.error('no platforms configured');

    return config
  }

  // if no args are passed, use the yml
  public async run(): Promise<void> {
    const { flags } = await this.parse(Publish);
    const config = await this.parseConfig()

    const fullReleaseName = `${config.account}/${config.project}/${config.release}`;
    console.log('Publishing', { platforms: config.platforms }, `as ${fullReleaseName}`);

    const privateKey = flags['private-key'] || await select();
    const metaTx = flags['meta-tx'];

    const apiURL = 'https://developers.hyperplay.xyz'
    const wallet = new ethers.Wallet(privateKey);
    const cookieJar = Publish.cookieJar ?? new CookieJar();
    const apiClient = wrapper(axios.create({ jar: cookieJar, withCredentials: true, baseURL: apiURL }));

    const provider = await this.provider(flags.network, privateKey);
    const valist = await create(provider, { metaTx });

    const address = await provider.getAddress();
    const chainId = await provider.getChainId();

    const accountID = valist.generateID(chainId, config.account);
    const projectID = valist.generateID(accountID, config.project);
    const releaseID = valist.generateID(projectID, config.release);

    const isAccountMember = await valist.isAccountMember(accountID, address);
    const isProjectMember = await valist.isProjectMember(projectID, address);

    if (!(isAccountMember || isProjectMember)) {
      this.error('user is not an account or project member');
    }

    const releaseExists = await valist.releaseExists(releaseID);
    if (releaseExists) {
      this.error(`release ${config.release} exists`);
    }

    CliUx.ux.action.start('uploading files');
    const release = await uploadRelease(valist, config);
    CliUx.ux.action.stop();
    CliUx.ux.log(`successfully uploaded files to IPFS: ${release.external_url}`);

    CliUx.ux.action.start('publishing release');
    const tx = await valist.createRelease(projectID, config.release, release);
    CliUx.ux.action.stop();

    CliUx.ux.action.start(`confirming transaction ${tx.hash}`);
    await tx.wait();
    CliUx.ux.action.stop();

    await loginAndPublish(
      apiClient, cookieJar, wallet, apiURL, projectID,
      fullReleaseName
    );

    CliUx.ux.log(`Successfully published ${config.account}/${config.project}/${config.release}!`);
    CliUx.ux.log(`view the release at:
    https://developers.hyperplay.xyz/${config.account}/${config.project}/settings
    ${release.external_url}
    ipfs://${release.external_url.replace('https://gateway.valist.io/ipfs/', '')}
    `);

    this.exit(0);
  }
}