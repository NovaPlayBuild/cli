import { ReleaseConfig, SupportedPlatform } from "@valist/sdk";
import { YamlConfig } from "./types";
import fs from 'fs';
import YAML from 'yaml';
import { FlagOutput } from "@oclif/core/lib/interfaces";

/* eslint-disable-next-line */
export function parseYml(args: {[name: string]: any;}, flags: FlagOutput): {config: ReleaseConfig, yamlConfig: YamlConfig | undefined} | undefined{
    let config: ReleaseConfig;
    let yamlConfig: YamlConfig | undefined = undefined;
    const flagPath = flags['ymlPath']
    const ymlPath = flagPath ? flagPath : 'hyperplay.yml'
    // cli args and flags
    if (args.account && args.project && args.release && !flags['useYml']) {
      config = new ReleaseConfig(args.account, args.project, args.release);
      const platformFlags: SupportedPlatform[] = ["web", "darwin_amd64", "darwin_arm64", "linux_amd64", "linux_arm64", "windows_amd64", "windows_arm64", "android_arm64"]
      for (const platform of platformFlags){
        if (flags[platform])
          config.platforms[platform] = flags[platform]
      }
      
      // using hyperplay.yml 
    } else if(fs.existsSync(ymlPath)){
      const data = fs.readFileSync(ymlPath, 'utf8');
      yamlConfig = YAML.parse(data);
      
      const configPlatforms: Record<string, string> = {}
      for (const [key, value] of Object.entries(yamlConfig!.platforms)){
        configPlatforms[key] = value.path
      }
      if (yamlConfig === undefined){
        return undefined
      }
      config = {...yamlConfig, platforms: configPlatforms}

      // override yaml if cli args are passed for acct, project, or release
      if (args.account) {
        config.account = args.account
      }
      if (args.project) {
        config.project = args.project
      }
      if (args.release) {
        config.release = args.release
      }
    }
    else {
        return undefined
    }
    return {config, yamlConfig}
}