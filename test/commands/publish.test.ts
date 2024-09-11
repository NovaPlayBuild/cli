import Publish from '../../src/commands/publish';
import { ethers } from 'ethers';
import { expect } from 'chai';
import { contracts, AccountMeta, ProjectMeta, Client, generateID, create } from '@valist/sdk';
import nock from 'nock'
import { CookieJar } from 'tough-cookie';
import { BrowserProvider } from 'ethers';

const url = 'https://developers.novaplay.io'
const publisherPrivateKey = '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
let provider: ethers.JsonRpcProvider;
let signer: ethers.JsonRpcSigner;
let walletPassedToPublishCommand: ethers.Wallet;

export type MockPlatform = {
    platformKey: string;
    fileName: string;
    partCount: number;
}

describe('publish CLI command', () => {
    let valist: Client
    let members: string[] = []
    let projectID: string
    let Registry: ethers.ContractFactory<unknown[], ethers.BaseContract>
    let License: ethers.ContractFactory<unknown[], ethers.BaseContract>

    before(async () => {
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
        signer = await provider.getSigner();
        walletPassedToPublishCommand = new ethers.Wallet(publisherPrivateKey, provider);
        Registry = new ethers.ContractFactory(contracts.registryABI, contracts.registryBytecode, signer);
        License = new ethers.ContractFactory(contracts.licenseABI, contracts.licenseBytecode, signer);

        const registry = await Registry.deploy(ethers.ZeroAddress);
        await registry.waitForDeployment()
        const registryAddress = await registry.getAddress();

        const license = await License.deploy(registry.target);
        await license.waitForDeployment()
        const licenseAddress = await license.getAddress();

        const optionsToPassToPublish = { subgraphUrl: 'http://localhost:8000/subgraphs/name/valist/dev', registryAddress, licenseAddress };
        Publish.options = optionsToPassToPublish;
        valist = await create(provider as unknown as BrowserProvider, { metaTx: false, ...optionsToPassToPublish });
        const address = await signer.getAddress();
        members = [address, walletPassedToPublishCommand.address];

        // send eth to walletPassedToPublishCommand
        const txn = {
            to: walletPassedToPublishCommand.address,
            value: ethers.parseEther('0.5')
        }
        await signer.sendTransaction(txn)

        const account = new AccountMeta();
        account.name = 'valist';
        account.description = 'Web3 digital distribution';
        account.external_url = 'https://valist.io';

        const createAccountTx = await valist.createAccount('valist', account, members);
        await createAccountTx.wait();

        const project = new ProjectMeta();
        project.name = 'cli';
        project.description = 'Valist CLI';
        project.external_url = 'https://github.com/valist-io/valist-js';

        const accountID = generateID(31337, 'valist');
        const createProjectTx = await valist.createProject(accountID, 'cli', project, members);
        await createProjectTx.wait();

        projectID = generateID(accountID, 'cli');
    })

    async function runPublishCommandWithMockData(releaseVersion: string, publishArgs: string[], mockPlatforms: MockPlatform[]) {
        nock(url)
            .get('/api/auth/session')
            .reply(200, {})
            .get('/api/auth/csrf')
            .reply(200, { data: { csrfToken: 'someCookieValue' } })
            .post('/api/v1/reviews/release')
            .reply(200, {})
            .post('/api/auth/callback/ethereum')
            .reply(200, {})
            .get('/api/v1/channels')
            .reply(200, {})
            .get(`/api/v1/channels?project_id=${projectID}`)
            .reply(200, [])

        const releaseID = valist.generateID(projectID, releaseVersion);

        const cookieJar = new CookieJar()
        cookieJar.setCookie('next-auth.csrf-token=someCookieValue', url)

        // Mock S3 signed URL request
        const s3BaseURL = 'https://valist-hpstore.s3.us-east-005.backblazeb2.com';
        nock(s3BaseURL)
            .persist()
            .put(/.*/)
            .reply(200, {}, { 'ETag': 'mock-etag' });

        nock(url)
            .post('/api/v1/uploads/releases/presigned-url')
            .reply(200, {
                uploadDetails: mockPlatforms.map(platform => ({
                    platformKey: platform.platformKey,
                    fileName: platform.fileName,
                    uploadId: 'mock-upload-id',
                    partUrls: Array.from({ length: platform.partCount }, (_, i) => ({
                        partNumber: i + 1,
                        url: `${s3BaseURL}/mock-part-url/${i + 1}`
                    })),
                    key: `test-ground/test44/0.0.18/${platform.platformKey}/${platform.fileName}`
                }))
            });

        mockPlatforms.forEach(platform => {
            nock(url)
                .put('/api/v1/uploads/complete-multipart-upload', {
                    uploadId: 'mock-upload-id',
                    key: `test-ground/test44/0.0.18/${platform.platformKey}/${platform.fileName}`,
                    parts: [{ PartNumber: 1, ETag: 'mock-etag' }]
                })
                .reply(200, { location: `${s3BaseURL}/test-ground/test44/0.0.18/${platform.platformKey}/${platform.fileName}` });
        });

        Publish.cookieJar = cookieJar
        try {
            await Publish.run(publishArgs);
            /* eslint-disable-next-line */
        } catch (e: any) {
            if (e.oclif === undefined || e.oclif.exit !== 0) throw e;
        }

        const releaseExists = await valist.releaseExists(releaseID);
        expect(releaseExists).to.be.true;
        const releaseMeta = await valist.getReleaseMeta(releaseID);
        return releaseMeta
    }

    it('should create a release with the publish command and the novaplay.yml file', async function () {
        const publishArgs = [
            `--private-key=${publisherPrivateKey}`,
            '--no-meta-tx',
            '--yml-path=./test/mock_data/novaplay.yml',
            '--network=http://127.0.0.1:8545/',
            '--skip_novaplay_publish'
        ]
        const mockPlatforms = [
            { platformKey: 'darwin_amd64', fileName: 'mac_x64.zip', partCount: 1 },
            { platformKey: 'darwin_arm64', fileName: 'mac_arm64.zip', partCount: 1 },
            { platformKey: 'windows_amd64', fileName: 'windows_amd64.zip', partCount: 1 },
            { platformKey: 'web', fileName: 'web.zip', partCount: 1 }
        ]
        const releaseMeta = await runPublishCommandWithMockData('v0.0.2', publishArgs, mockPlatforms)
        const platformKeys = Object.keys(releaseMeta.platforms)
        expect(platformKeys.includes('web')).true
        expect(platformKeys.includes('darwin_amd64')).true
        expect(platformKeys.includes('darwin_arm64')).true
        expect(platformKeys.includes('windows_amd64')).true
    });

    it('should create a release with custom keys and some files and folders not zipped', async function () {
        const publishArgs = [
            `--private-key=${publisherPrivateKey}`,
            '--no-meta-tx',
            '--yml-path=./test/mock_data/novaplay_publish.yml',
            '--network=http://127.0.0.1:8545/',
            '--skip_novaplay_publish'
        ]
        const mockPlatforms = [
            { platformKey: 'NovaPlay-0.12.0-macOS-arm64.dmg', fileName: 'dmg.txt', partCount: 1 },
            { platformKey: 'darwin_arm64_dmg_zip_blockmap', fileName: 'mac_arm64.zip', partCount: 1 },
            { platformKey: 'windows_amd64', fileName: 'windows_amd64.zip', partCount: 1 },
            { platformKey: 'latest_mac_yml', fileName: 'web.zip', partCount: 1 }
        ]
        const releaseMeta = await runPublishCommandWithMockData('v0.0.3', publishArgs, mockPlatforms)
        const platformKeys = Object.keys(releaseMeta.platforms)
        expect(platformKeys.includes('NovaPlay-0.12.0-macOS-arm64.dmg')).true
        expect(platformKeys.includes('darwin_arm64_dmg_zip_blockmap')).true
        expect(platformKeys.includes('windows_amd64')).true
        expect(platformKeys.includes('latest_mac_yml')).true
        expect(releaseMeta.platforms.windows_amd64?.installScript).eq('install_deps.exe')
        expect(releaseMeta.platforms.windows_amd64?.executable).eq('test_win_x64.txt')
        expect(releaseMeta.description).to.eq('This release starts Kosium Season 1000. Can you conquer the oppressor forces stronghold on Mars?')
    })
})
