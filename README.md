# @hyperplay/cli

## Usage

```yml
account: test-ground
project: test44
release: 0.0.7

platforms:
  darwin_amd64: dist/darwin/amd64/hello-go
  darwin_arm64: dist/darwin/arm64/hello-go
  linux_amd64: dist/linux/amd64/hello-go
  windows_amd64: dist/windows/amd64/hello-go

```

```bash
hyperplay publish test-ground/test-44/0.0.5 ipfs.zip
```
