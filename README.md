# CoCreate-cli

A simple cli component in vanilla javascript. Easily configured using HTML5 attributes and/or JavaScript API. Take it for a spin in our [playground!](https://CoCreateJS.com/docs/cli)

![GitHub latest release](https://img.shields.io/github/v/release/CoCreateJS/cli?flat-square)
![GitHub](https://img.shields.io/github/license/CoCreateJS/cli?style=flat-square)
![Hiring](https://img.shields.io/static/v1?style=flat-square&label=&message=Hiring&color=blueviolet)

![CoCreate-cli](https://cdn.CoCreateJS.com/docs/CoCreate-cli.gif)

## [Docs & Demo](https://CoCreateJS.com/docs/cli)


For a complete guide and working demo refer to the [doumentation](https://CoCreateJS.com/docs/cli)

## NPM

```shell
$ npm i @cocreate/cli
```
* this will read the "repositories.js" from current directory -
 ```sh
 coc command
 ```
 
* or you can pass relative path to config file -
 ```sh
 coc --config src/repositories.js command
 ```

## Parse configured module documentation

```sh
coc docs
coc docs --json
```

The command reads the current `CoCreate.config.js`, parses JSDoc from each
configured module and plugin's `src` directory, and skips entries with
`exclude: ["docs"]`. Set `documentation.template` to a directory containing
`index.html` and `page.html`, and `documentation.output` to the destination
directory. `coc docs` then writes an index and one page per configured module.
`coc docs --json` prints the structured dataset: `{ type, schemaVersion,
errors, modules }`. Each module contains its metadata, JSDoc `doclets`, and
separate `api` and `declarative` arrays. Doclets tagged with `@attribute`
are declarative; the rest are API records. The deprecated
`package.json:cocreate.interface` field is not read.

`coc interface` returns these Docs module records as JSON. Use `--api` or
`--declarative` to select one collection, and `--client` or `--server` to
filter modules and doclets by their `@environment` tags. Without environment
flags, both environments are included.

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Announcements](#announcements)
- [Roadmap](#roadmap)
- [How to Contribute](#how-to-contribute)
- [About](#about)
- [License](#license)

<a name="announcements"></a>

# Announcements

All updates to this library are documented in our [CHANGELOG](https://github.com/CoCreateJS/cli/blob/master/CHANGELOG.md) and [releases](https://github.com/CoCreateJS/cli/releases). You may also subscribe to email for releases and breaking changes.

<a name="roadmap"></a>

# Roadmap

If you are interested in the future direction of this project, please take a look at our open [issues](https://github.com/CoCreateJS/cli/issues) and [pull requests](https://github.com/CoCreateJS/cli/pulls). We would love to hear your feedback.

<a name="about"></a>

# About

CoCreate-cli is guided and supported by the CoCreate Developer Experience Team.

Please Email the Developer Experience Team [here](mailto:develop@CoCreateJS.com) in case of any queries.

CoCreate-cli is maintained and funded by CoCreate. The names and logos for CoCreate are trademarks of CoCreate, LLC.

<a name="contribute"></a>

# How to Contribute

We encourage contribution to our libraries (you might even score some nifty swag), please see our [CONTRIBUTING](https://github.com/CoCreateJS/cli/blob/master/CONTRIBUTING.md) guide for details.

We want this library to be community-driven, and CoCreate led. We need your help to realize this goal. To help make sure we are building the right things in the right order, we ask that you create [issues](https://github.com/CoCreateJS/cli/issues) and [pull requests](https://github.com/CoCreateJS/cli/pulls) or merely upvote or comment on existing issues or pull requests.

We appreciate your continued support, thank you!


<a name="license"></a>
# License

[The MIT License (MIT)](https://github.com/CoCreateJS/cli/blob/master/LICENSE)

