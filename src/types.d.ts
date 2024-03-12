export interface PlatformYamlConfig {
    path: string,
    zip: boolean
}

export interface YamlConfig {
    account: string,
    project: string,
    release: string,
    platforms: Record<string, PlatformYamlConfig>
}
