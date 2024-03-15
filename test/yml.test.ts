import { parseYml } from "../src/yml"
import { expect } from 'chai';

describe('YML Tests', ()=>{
    it('should parse hyperplay.yml', ()=>{
        const args = {
            account: 'hyperplaycd',
            project: 'desktop',
            release: 'v0.12.0'
        }
        const flags = {
            "use-yml": true,
            "yml-path": './test/mock_data/hyperplay.yml'
        }
        const parsed = parseYml(args, flags)
        if (parsed === undefined){
            throw 'Parsed was undefined'
        }
        const config = parsed
        expect(config.account).to.eq('hyperplaycd')
        expect(config.project).to.eq('desktop')
        expect(config.release).to.eq('v0.12.0')
        expect(config.platforms['darwin_amd64']).to.eq('./mock_data/mac_x64')
    })

    it('should parse hyperplay_client.yml', ()=>{
        const args = {
            account: 'hyperplaycd',
            project: 'desktop',
            release: 'v0.12.0'
        }
        const flags = {
            "use-yml": true,
            "yml-path": './test/mock_data/hyperplay_client.yml'
        }
        const parsed = parseYml(args, flags)
        if (parsed === undefined){
            throw 'Parsed was undefined'
        }
        const config = parsed
        expect(config.account).to.eq('hyperplaycd')
        expect(config.project).to.eq('desktop')
        expect(config.release).to.eq('v0.12.0')
        expect(config.platforms['darwin_amd64_dmg_zip_blockmap']).to.eq('./test/mock_data/HyperPlay-0.12.0-macOS-x64.zip.blockmap')
        expect(config?.platforms['darwin_amd64_dmg_zip_blockmap'].zip).to.eq(false)
    })
})