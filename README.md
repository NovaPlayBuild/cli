# HyperPlay CLI

HyperPlay command line interface.

<!-- toc -->
* [HyperPlay CLI](#hyperplay-cli)
* [Install](#install)
* [Usage](#usage)
* [Commands](#commands)
* [FAQ](#faq)
<!-- tocstop -->

# Install 

<!-- install -->
```sh-session
$ npm install -g @hyperplay/cli
$ hyperplay help
```
OR
```sh-session
$ npx @hyperplay/cli help
```
<!-- installstop -->

# Usage

<!-- usage -->
```sh-session
$ hyperplay COMMAND
running command...
$ hyperplay --version
@hyperplay/cli/2.10.2 win32-x64 node-v20.8.0
$ hyperplay help [COMMAND]
USAGE
  $ hyperplay COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`hyperplay help [COMMANDS]`](#hyperplay-help-commands)
* [`hyperplay import`](#hyperplay-import)
* [`hyperplay keygen`](#hyperplay-keygen)
* [`hyperplay publish [ACCOUNT] [PROJECT] [RELEASE]`](#hyperplay-publish-account-project-release)

## `hyperplay help [COMMANDS]`

Display help for hyperplay.

```
USAGE
  $ hyperplay help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

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

## `hyperplay publish [ACCOUNT] [PROJECT] [RELEASE]`

Publish a release

```
USAGE
  $ hyperplay publish [ACCOUNT] [PROJECT] [RELEASE] [--meta-tx] [--network <value>] [--private-key <value>]
    [--skip_hyperplay_publish] [--channel <value>] [--use-yml] [--yml-path <value>]

ARGUMENTS
  ACCOUNT  account name
  PROJECT  project name
  RELEASE  release name

FLAGS
  --channel=<value>              [default: main] Publish build to this release channel on HyperPlay.
  --[no-]meta-tx                 Enable meta transactions
  --network=<value>              [default: https://rpc.valist.io] Blockchain network
  --private-key=<value>          Account private key
  --[no-]skip_hyperplay_publish  Do not publish to HyperPlay. Only Valist.
  --use-yml                      Use hyperplay.yml to get platform config
  --yml-path=<value>             Path to yml file containing publish args

DESCRIPTION
  Publish a release

EXAMPLES
  $ hyperplay publish ipfs/go-ipfs/v0.12.3 README.md

  $ hyperplay publish ipfs/go-ipfs/v0.12.3 dist/
```

<!-- commandsstop -->

Flags can also be specified with environment variables:
```bash
HYPERPLAY_PRIVATE_KEY=0x123
HYPERPLAY_NETWORK=polygon
HYPERPLAY_ANDROID_AMD64_BUILD=./android/amd64
HYPERPLAY_SKIP_HYPERPLAY_PUBLISH=false
HYPERPLAY_TARGET_CHANNEL=beta
```

# FAQ

## How do I fix "user is not an account or project member"?

Make sure you pass the private key of your Release Manager with the flag `--private-key=<private_key>` 

For HyperPlay Projects, make sure the public key is added as a Release Manager on your HyperPlay project. You can modify the project members at https://developers.hyperplay.xyz/<account_name>/<project_name>/settings.

It is also possible to add the public key directly to your project through the [Valist registry](https://polygonscan.com/address/0xd504d012d78b81fa27288628f3fc89b0e2f56e24) by calling `addProjectMember`.

## How do I find my account or project name?

To get the account name, navigate to the [HyperPlay Dev Portal](https://developers.hyperplay.xyz) and on the project card, you can find your account name in the "Published by: <account_name" text.

![image](https://github.com/HyperPlay-Gaming/cli/assets/27568879/d1f89e34-c6e0-494b-bba8-eb29a8c161fe)

To get the project name, click the project card. The project name is in the text input field with the "Game Name" label, shown below.

![image](https://github.com/HyperPlay-Gaming/cli/assets/27568879/f85b4e4b-0a1c-44df-a277-954fe48766ea)
