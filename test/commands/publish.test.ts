import Publish from '../../src/commands/publish';
import { ethers } from 'ethers';
import { expect } from 'chai';
import { contracts, create, AccountMeta, ProjectMeta } from '@valist/sdk';
import nock from 'nock'
import { CookieJar } from 'tough-cookie';
import ganache from 'ganache'

const web3 = ganache.provider({ wallet: { deterministic: true }, 
    logging: {
        logger: {
            log: () => {} // don't do anything to prevent console spamming
        }
    } 
});

// @ts-expect-error type mismatch
const provider = new ethers.providers.Web3Provider(web3);
const signer = provider.getSigner();

const Registry = new ethers.ContractFactory(contracts.registryABI, contracts.registryBytecode, signer);
const License = new ethers.ContractFactory(contracts.licenseABI, contracts.licenseBytecode, signer);

describe('publish CLI command', () => {
    it('should create a release', async function () {
        const registry = await Registry.deploy(ethers.constants.AddressZero);
        await registry.deployed();

        const license = await License.deploy(registry.address);
        await license.deployed();

        const valist = await create(provider, { metaTx: false });
        const address = await signer.getAddress();
        const members = [address];

        const account = new AccountMeta();
        account.name = 'valist';
        account.description = 'Web3 digital distribution';
        account.external_url = 'https://valist.io';

        const project = new ProjectMeta();
        project.name = 'cli';
        project.description = 'Valist CLI';
        project.external_url = 'https://github.com/valist-io/valist-js';

        const accountID = valist.generateID(1337, 'valist');
        const projectID = valist.generateID(accountID, 'cli');
        const releaseID = valist.generateID(projectID, 'v0.0.1');

        const createAccountTx = await valist.createAccount('valist', account, members);
        await createAccountTx.wait();

        const createProjectTx = await valist.createProject(accountID, 'cli', project, members);
        await createProjectTx.wait();

        const url = 'https://developers.hyperplay.xyz'
        nock(url)
            .get('/api/auth/session')
            .reply(200, {})
            .get('/api/auth/csrf')
            .reply(200, {data: {csrfToken: 'someCookieValue'}})
            .post('/api/v1/reviews/release')
            .reply(200, {})
            .post('/api/auth/callback/ethereum')
            .reply(200, {})
            .get('/api/v1/channels')
            .reply(200, {})
            .get(`/api/v1/channels?project_id=${projectID}`)
            .reply(200, [])

        const cookieJar = new CookieJar()
        cookieJar.setCookie('next-auth.csrf-token=someCookieValue', url)

        Publish.cookieJar = cookieJar
        Publish.provider = signer;
        try {
            const mockDataFolder = './test/mock_data'   ; 
            await Publish.run([
                'valist',
                'cli',
                'v0.0.1',
                `--web=${mockDataFolder}/web`,
                `--darwin_amd64=${mockDataFolder}/mac_amd64`,
                `--darwin_arm64=${mockDataFolder}/mac_arm64`,
                `--windows_amd64=${mockDataFolder}/windows_amd64`,
                '--private-key=4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
                '--no-meta-tx'
            ]);
        /* eslint-disable-next-line */
        } catch (e: any) {
            if (e.oclif === undefined || e.oclif.exit !== 0) throw e;
        }

        const releaseExists = await valist.releaseExists(releaseID);
        expect(releaseExists).to.be.true;
        const releaseMeta = await valist.getReleaseMeta(releaseID);
        const platformKeys = Object.keys(releaseMeta.platforms)
        expect(platformKeys.includes('web')).true
        expect(platformKeys.includes('darwin_amd64')).true
        expect(platformKeys.includes('darwin_arm64')).true
        expect(platformKeys.includes('windows_amd64')).true
    });
})
