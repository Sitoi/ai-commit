<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/Sitoi/ai-commit/blob/main/images/logo.png?raw=true">

<h1>AI Commit</h1>

Review Git staged changes, generate standardized Conventional Commit messages using Azure/OpenAI API to simplify submissions and maintain consistency.

**English** · [简体中文](./README.zh_CN.md) · [报告问题][github-issues-link] · [请求功能][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![](https://github.com/sitoi/ai-commit/blob/main/aicommit.gif?raw=true)

</div>

## ✨ Features

- [x] 🤯 Support generating commit messages based on git diffs using ChatGPT / Azure API.
- [x] 🗺️ Support multi-language commit messages.
- [x] 😜 Support adding Gitmoji.
- [x] 📝 Support Conventional Commits specification.

## 📦 Installation

1. Search for "AI Commit" in VSCode and click the "Install" button.
2. Install it directly from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit).

> **Note**\
> Make sure your node version >= 16

## 🤯 Usage

1. Ensure that you have installed and enabled the "AI Commit" extension.
2. In VSCode settings, locate the "ai-commit" configuration options and configure them as needed.
3. Make changes in your project and add the changes to the staging area (git add).
4. Next to the commit message input box in the "Source Control" panel, click the "AI Commit" icon button. After clicking, the extension will generate a commit message and populate it in the input box.
5. Review the generated commit message, and if you are satisfied, proceed to commit your changes.

> **Note**\
> If the code exceeds the maximum token length, consider adding it to the staging area in batches.

### ⚙️ Configuration

In the VSCode settings, locate the "ai-commit" configuration options and configure them as needed:

| Configuration      |  Type   |    Default    | Required |                                            Notes                                             |
| :----------------- | :-----: | :-----------: | :------: | :------------------------------------------------------------------------------------------: |
| OPENAI_API_KEY     | string  |     None      |   Yes    |                 [OpenAI token](https://platform.openai.com/account/api-keys)                 |
| OPENAI_BASE_URL    | string  |     None      |    No    |     If using Azure, use: https://{resource}.openai.azure.com/openai/deployments/{model}      |
| OPENAI_MODEL       | string  | gpt-3.5-turbo |   Yes    |                                         OpenAI MODEL                                         |
| AZURE_API_VERSION  | string  |     None      |    No    |                                      AZURE_API_VERSION                                       |
| AI_COMMIT_LANGUAGE | string  |      en       |   Yes    |                                    Supports 19 languages                                     |
| EMOJI_ENABLED      | boolean |     true      |   Yes    |                                   Enable or disable Emoji                                    |
| FULL_GITMOJI_SPEC  | boolean |     false     |    No    | Enable the complete GitEmoji specification, see [https://gitmoji.dev/](https://gitmoji.dev/) |

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Alternatively, you can clone the repository and run the following commands for local development:

```bash
$ git clone https://github.com/sitoi/ai-commit.git
$ cd ai-commit
$ npm install
```

Open the project folder in VSCode. Press F5 to run the project. This will open a new Extension Development Host window and launch the plugin within it.

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

## 🔗 Links

### Credits

- **auto-commit** - <https://github.com/lynxife/auto-commit>
- **opencommit** - <https://github.com/di-sukharev/opencommit>

---

#### 📝 License

This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[github-codespace-link]: https://codespaces.new/sitoi/ai-commit
[github-codespace-shield]: https://github.com/codespaces/badge.svg
[github-contributors-link]: https://github.com/sitoi/ai-commit/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/sitoi/ai-commit?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/sitoi/ai-commit/network/members
[github-forks-shield]: https://img.shields.io/github/forks/sitoi/ai-commit?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/sitoi/ai-commit/issues
[github-issues-shield]: https://img.shields.io/github/issues/sitoi/ai-commit?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/sitoi/ai-commit/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/sitoi/ai-commit?color=white&labelColor=black&style=flat-square
[github-stars-link]: https://github.com/sitoi/ai-commit/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/sitoi/ai-commit?color=ffcb47&labelColor=black&style=flat-square
[pr-welcome-link]: https://github.com/sitoi/ai-commit/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[github-contrib-link]: https://github.com/sitoi/ai-commit/graphs/contributors
[github-contrib-shield]: https://contrib.rocks/image?repo=sitoi%2Fai-commit
