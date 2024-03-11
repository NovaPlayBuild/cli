# HyperPlay CLI

HyperPlay command line interface.

<!-- toc -->
* [HyperPlay CLI](#hyperplay-cli)
* [Install](#install)
* [Usage](#usage)
  * [Flags & Environment Variables](#flags_and_env)
  * [YML](#yml)
* [Commands](#commands)
<!-- tocstop -->

# Install 

<!-- install -->
```sh-session
$ npm install -g @hyperplay/cli
$ @hyperplay/cli
# OR
$ npx @hyperplay/cli
```
<!-- installstop -->

# Usage

<!-- usage -->
```sh-session
$ hyperplay COMMAND
running command...
$ hyperplay --version
@hyperplay/cli/2.9.1 darwin-arm64 node-v16.13.0
$ hyperplay --help [COMMAND]
USAGE
  $ hyperplay COMMAND
...
```

## Flags & Environment Variables
```bash
$ hyperplay publish [ACCOUNT] [PROJECT] [RELEASE] [--meta-tx] [--network <value>] [--private-key <value>] [--web <value>]
    [--darwin_amd64 <value>] [--darwin_arm64 <value>] [--windows_amd64 <value>] [--skip_hyperplay_publish] [--channel <value>]
```

Flags can also be specified with environment variables:
```bash
HYPERPLAY_PRIVATE_KEY=0x123
HYPERPLAY_NETWORK=polygon
HYPERPLAY_WEB_BUILD=./web
HYPERPLAY_DARWIN_AMD64_BUILD=./darwin/amd64
HYPERPLAY_DARWIN_ARM64_BUILD=./darwin/arm64
HYPERPLAY_WINDOWS_ARM64_BUILD=./windows/arm64
HYPERPLAY_WINDOWS_AMD64_BUILD=./windows/amd64
HYPERPLAY_LINUX_AMD64_BUILD=./linux/amd64
HYPERPLAY_LINUX_ARM64_BUILD=./linux/arm64
HYPERPLAY_ANDROID_AMD64_BUILD=./android/amd64
HYPERPLAY_SKIP_HYPERPLAY_PUBLISH=false
HYPERPLAY_TARGET_CHANNEL=beta
```

## YML
Create a `hyperplay.yml` in your project folder.

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

Run the publish command from the hyperplay cli. Set the publisher private key via an envrionment variable if CI/CD.
```bash
HYPERPLAY_PRIVATE_KEY=0x1234 hyperplay publish
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`hyperplay help [COMMAND]`](#hyperplay-help-command)
* [`hyperplay import`](#hyperplay-import)
* [`hyperplay keygen`](#hyperplay-keygen)
* [`hyperplay publish [PACKAGE] [PATH]`](#hyperplay-publish-package-path)

## `hyperplay help [COMMAND]`

Display help for hyperplay.

```
USAGE
  $ hyperplay help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for hyperplay.
```

## `hyperplay import`

Import an account

```
USAGE
  $ hyperplay import

DESCRIPTION
  Import an account

EXAMPLES
  $ hyperplay import
```

## `hyperplay keygen`

Generate a new account

```
USAGE
  $ hyperplay keygen

DESCRIPTION
  Generate a new account

EXAMPLES
  $ hyperplay keygen
```

## `hyperplay publish [PACKAGE] [PATH]`

Publish a release

```
USAGE
  $ hyperplay publish [ACCOUNT] [PROJECT] [RELEASE] [--meta-tx] [--network <value>] [--private-key <value>] [--web <value>]
    [--darwin_amd64 <value>] [--darwin_arm64 <value>] [--windows_amd64 <value>] [--skip_hyperplay_publish] [--channel <value>]

ARGUMENTS
  ACCOUNT  account name
  PROJECT  project name
  RELEASE  release name

FLAGS
  --channel=<value>              [default: main] Publish build to this release channel on HyperPlay.
  --darwin_amd64=<value>         Path to darwin amd64 build
  --darwin_arm64=<value>         Path to darwin arm64 build
  --[no-]meta-tx                 Enable meta transactions
  --network=<value>              [default: https://rpc.valist.io] Blockchain network
  --private-key=<value>          Account private key
  --[no-]skip_hyperplay_publish  Do not publish to HyperPlay. Only Valist.
  --web=<value>                  Path to web build
  --windows_amd64=<value>        Path to windows amd64 build

DESCRIPTION
  Publish a release

EXAMPLES
  $ hyperplay publish ipfs/go-ipfs/v0.12.3 README.md

  $ hyperplay publish ipfs/go-ipfs/v0.12.3 dist/
```
<!-- commandsstop -->