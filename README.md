<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/Sitoi/ai-commit/blob/main/images/logo.png?raw=true">

<h1>AI Commit</h1>

Use OpenAI / Azure OpenAI / DeepSeek / Grok / Gemini / Claude (Anthropic) API to review Git changes, generate conventional commit messages that meet the conventions, simplify the commit process, and keep the commit conventions consistent.

**English** · [简体中文](./README.zh_CN.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][vscode-marketplace-shield]][vscode-marketplace-link]
[![][total-installs-shield]][total-installs-link]
[![][avarage-rating-shield]][avarage-rating-link]
[![][github-license-shield]][github-license-link]

![](https://github.com/sitoi/ai-commit/blob/main/aicommit.gif?raw=true)

</div>

## ✨ Features

- 🤯 Support generating commit messages based on git diffs using OpenAI / Azure OpenAI / DeepSeek / Grok / Gemini / Claude (Anthropic) API.
- 🧠 Support OpenAI Responses API with configurable reasoning effort and output verbosity.
- 🗺️ Support multi-language commit messages.
- 😜 Support adding Gitmoji.
- 🛠️ Support custom system prompt.
- 📝 Support Conventional Commits specification.

## 📦 Installation

1. Search for "AI Commit" in VSCode and click the "Install" button.
2. Install it directly from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit).

> **Note**\
> Make sure your node version >= 16

## 🤯 Usage

1. Ensure that you have installed and enabled the "AI Commit" extension.
2. In VSCode settings, locate the "ai-commit" configuration options and configure them as needed.
3. Make changes in your project and add the changes to the staging area (git add).
4. (Optional) If you want to provide additional context for the commit message, type it in the Source Control panel's message input box before clicking the AI Commit button.
5. Next to the commit message input box in the "Source Control" panel, click the "AI Commit" icon button. After clicking, the extension will generate a commit message (considering any additional context if provided) and populate it in the input box.
6. Review the generated commit message, and if you are satisfied, proceed to commit your changes.

> **Note**\
> If the code exceeds the maximum token length, consider adding it to the staging area in batches.

### ⚙️ Configuration

> **Note** Version >= 0.0.5 Don't need to configure `EMOJI_ENABLED` and `FULL_GITMOJI_SPEC`, Default Prompt is [prompt/with_gitmoji.md](./prompt/with_gitmoji.md), If don't need to use `Gitmoji`. Please set `SYSTEM_PROMPT` to your custom prompt, please refer to [prompt/without_gitmoji.md](./prompt/without_gitmoji.md).

In the VSCode settings, locate the "ai-commit" configuration options and configure them as needed:

| Configuration           |  Type  |          Default           | Required |                                                               Notes                                                                |
| :---------------------- | :----: | :------------------------: | :------: | :--------------------------------------------------------------------------------------------------------------------------------: |
| AI_PROVIDER             | string |           openai           |   Yes    |                                        AI Provider to use: `openai`, `gemini`, or `claude`                                         |
| OPENAI_API_KEY          | string |            None            |   Yes    |               Required when `AI_PROVIDER` is `openai`. [OpenAI token](https://platform.openai.com/account/api-keys)                |
| OPENAI_BASE_URL         | string |            None            |    No    |                       If using Azure, use: `https://{resource}.openai.azure.com/openai/deployments/{model}`                        |
| OPENAI_MODEL            | string |           gpt-4o           |   Yes    |                     OpenAI model. Run the `Show Available OpenAI Models` command to pick from available models                     |
| AZURE_API_VERSION       | string |            None            |    No    |                                                      Azure API version string                                                      |
| OPENAI_TEMPERATURE      | number |            0.7             |    No    |               Controls randomness. Range: 0–2. Lower = more focused, Higher = more creative. (Chat Completions only)               |
| OPENAI_API_TYPE         | string |         completion         |    No    |                             Choose API: `completion` (Chat Completions) or `response` (Responses API)                              |
| OPENAI_REASONING_EFFORT | string |           medium           |    No    |     Reasoning effort for Responses API: `minimal`, `low`, `medium`, `high`. Only applies when `OPENAI_API_TYPE` is `response`      |
| OPENAI_TEXT_VERBOSITY   | string |           medium           |    No    |             Output verbosity for Responses API: `low` (~1000 tokens), `medium` (~4000 tokens), `high` (~16000 tokens)              |
| GEMINI_API_KEY          | string |            None            |   Yes    |                Required when `AI_PROVIDER` is `gemini`. [Gemini API key](https://makersuite.google.com/app/apikey)                 |
| GEMINI_MODEL            | string |    gemini-2.0-flash-001    |   Yes    |                                                        Gemini model to use                                                         |
| GEMINI_TEMPERATURE      | number |            0.7             |    No    |                           Controls randomness. Range: 0–2. Lower = more focused, Higher = more creative                            |
| CLAUDE_API_KEY          | string |            None            |    No    | Anthropic API key. Leave empty to use Claude CLI (authenticated via `claude setup-token`). Required when `AI_PROVIDER` is `claude` |
| CLAUDE_MODEL            | string | claude-sonnet-4-5-20250929 |    No    |                                                        Claude model to use                                                         |
| CLAUDE_TEMPERATURE      | number |            0.7             |    No    |                                                  Controls randomness. Range: 0–1                                                   |
| AI_COMMIT_LANGUAGE      | string |          English           |   Yes    |                                                       Supports 20 languages                                                        |
| SYSTEM_PROMPT           | string |            None            |    No    |                                                        Custom system prompt                                                        |

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

### 💗 All Thanks To Our Contributors

[![][github-contrib-shield]][github-contrib-link]

## 🔗 Links

### Credits

- **auto-commit** - <https://github.com/lynxife/auto-commit>
- **opencommit** - <https://github.com/di-sukharev/opencommit>

---

## 📝 License

This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[github-codespace-link]: https://codespaces.new/sitoi/ai-commit
[github-codespace-shield]: https://github.com/sitoi/ai-commit/blob/main/images/codespaces.png?raw=true
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
[vscode-marketplace-link]: https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit
[vscode-marketplace-shield]: https://img.shields.io/vscode-marketplace/v/Sitoi.ai-commit.svg?label=vscode%20marketplace&color=blue&labelColor=black&style=flat-square
[total-installs-link]: https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit
[total-installs-shield]: https://img.shields.io/vscode-marketplace/d/Sitoi.ai-commit.svg?&color=greeen&labelColor=black&style=flat-square
[avarage-rating-link]: https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit
[avarage-rating-shield]: https://img.shields.io/vscode-marketplace/r/Sitoi.ai-commit.svg?&color=green&labelColor=black&style=flat-square
