import { expect } from 'chai';
import { getZipName } from '../../src/utils/getZipName'

describe('Zip Name Tests', ()=>{
    it('should get the folder name when zipping the same folder as hyperplay.yml', ()=>{
        const name = getZipName('.').toLowerCase()
        expect(name).to.eq('./cli.zip')
    })

    it('should get the folder name for subdirectory path', ()=>{
        const name = getZipName('../mock_data/windows_amd64')
        expect(name).to.eq('./windows_amd64.zip')
    })

    it('should get the file name for file path', ()=>{
        const name = getZipName('../mock_data/dmg.txt')
        expect(name).to.eq('./dmg.zip')
    })
})