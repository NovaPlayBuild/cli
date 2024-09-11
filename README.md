# NovaPlay CLI

NovaPlay command line interface.

<!-- toc -->
* [NovaPlay CLI](#novaplay-cli)
* [Install](#install)
* [Usage](#usage)
* [dist/windows/amd64/hello-go.zip zipped in a separate step so we don't need to zip with the cli](#distwindowsamd64hello-gozip-zipped-in-a-separate-step-so-we-dont-need-to-zip-with-the-cli)
* [Commands](#commands)
* [FAQ](#faq)
<!-- tocstop -->

# Install 

<!-- install -->
```sh-session
$ npm install -g @novaplay/cli
$ novaplay help
```
OR
```sh-session
$ npx @novaplay/cli help
```
<!-- installstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @novaplay/cli
$ novaplay COMMAND
running command...
$ novaplay (--version)
@novaplay/cli/2.13.0 darwin-arm64 node-v20.12.2
$ novaplay --help [COMMAND]
USAGE
  $ novaplay COMMAND
...
```
<!-- usagestop -->

## Publish

The `publish` command requires a local YML file. The default YML path used is `./novaplay.yml`, but you can also specify the path to this file with the `--yml-path` flag or the `HYPERPLAY_YML_PATH` environment variable.

Note that in either case, you must pass a private key for an address added to your project or account with the cli flag `--private-key <value>`.

### YML
Create a `novaplay.yml` in your project folder.

`zip` is true if you want to zip the folder or file prior to upload.
- Note that for NovaPlay submissions, you will need `zip: true` unless you are uploading a zip file.

Example YML config file:
```yml
account: test-ground
project: test44
release: 0.0.7

description: Release notes go here.

platforms:
  darwin_amd64: 
    path: dist/darwin/amd64/hello-go
    zip: true
    executable: go_app
  darwin_arm64: 
    path: dist/darwin/arm64/hello-go
    zip: true
    executable: go_app
  linux_amd64: 
    path: dist/linux/amd64/hello-go
    zip: true
    executable: go_app
# dist/windows/amd64/hello-go.zip zipped in a separate step so we don't need to zip with the cli
  windows_amd64: 
    path: dist/windows/amd64/hello-go.zip
    zip: false
    executable: go_app.exe
    installScript: install_deps.exe

```

Run the publish command from the novaplay cli. Set the publisher private key via an envrionment variable if CI/CD.
```bash
HYPERPLAY_PRIVATE_KEY=0x1234 novaplay publish
```

# Commands
<!-- commands -->
* [`novaplay help [COMMANDS]`](#novaplay-help-commands)
* [`novaplay import`](#novaplay-import)
* [`novaplay keygen`](#novaplay-keygen)
* [`novaplay publish [ACCOUNT] [PROJECT] [RELEASE]`](#novaplay-publish-account-project-release)

## `novaplay help [COMMANDS]`

Display help for novaplay.

```
USAGE
  $ novaplay help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for novaplay.
```

## `novaplay import`

Import an account

```
USAGE
  $ novaplay import

DESCRIPTION
  Import an account

EXAMPLES
  $ novaplay import
```

## `novaplay keygen`

Generate a new account

```
USAGE
  $ novaplay keygen

DESCRIPTION
  Generate a new account

EXAMPLES
  $ novaplay keygen
```

## `novaplay publish [ACCOUNT] [PROJECT] [RELEASE]`

Publish a release

```
USAGE
  $ novaplay publish [ACCOUNT] [PROJECT] [RELEASE] [--meta-tx] [--network <value>] [--private-key <value>]
    [--skip_novaplay_publish] [--channel <value>] [--yml-path <value>]

ARGUMENTS
  ACCOUNT  account name
  PROJECT  project name
  RELEASE  release name

FLAGS
  --channel=<value>              [default: main] Publish build to this release channel on NovaPlay.
  --[no-]meta-tx                 Enable meta transactions
  --network=<value>              [default: https://rpc.valist.io] Blockchain network
  --private-key=<value>          Account private key
  --[no-]skip_novaplay_publish  Do not publish to NovaPlay. Only Valist.
  --yml-path=<value>             Path to yml file containing publish args

DESCRIPTION
  Publish a release

EXAMPLES
  $ novaplay publish ipfs/go-ipfs/v0.12.3 README.md

  $ novaplay publish ipfs/go-ipfs/v0.12.3 dist/
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

For NovaPlay Projects, make sure the public key is added as a Release Manager on your NovaPlay project. You can modify the project members at https://developers.novaplay.io/<account_name>/<project_name>/settings.

It is also possible to add the public key directly to your project through the [Valist registry](https://polygonscan.com/address/0xd504d012d78b81fa27288628f3fc89b0e2f56e24) by calling `addProjectMember`.

## How do I find my account or project name?

To get the account name, navigate to the [NovaPlay Dev Portal](https://developers.novaplay.io) and on the project card, you can find your account name in the "Published by: <account_name" text.

![image](https://raw.githubusercontent.com/NovaPlay-Gaming/cli/main/public/account_name.png)

To get the project name, click the project card. The project name is in the text input field with the "Game Name" label, shown below.

![image](https://raw.githubusercontent.com/NovaPlay-Gaming/cli/main/public/project_name.png)
