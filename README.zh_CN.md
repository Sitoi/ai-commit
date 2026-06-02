<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/Sitoi/ai-commit/blob/main/images/logo.png?raw=true">

<h1>AI Commit</h1>

使用 OpenAI / Azure OpenAI / DeepSeek / Grok / Gemini / Claude (Anthropic) API 审查 Git 暂存区修改，生成符合 Conventional Commit 规范的提交消息，简化提交流程，保持提交规范一致。

[English](./README.md) · **简体中文** · [报告问题][github-issues-link] · [请求功能][github-issues-link]

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

## ✨ 特性

- 🤯 支持使用 OpenAI / Azure OpenAI / DeepSeek / Grok / Gemini / Claude (Anthropic) API 根据 git diffs 自动生成提交信息
- 🧠 支持 OpenAI Responses API，可配置推理强度（reasoning effort）和输出详细程度
- 🗺️ 支持多语言提交信息
- 😜 支持添加 Gitmoji
- 🛠️ 支持自定义系统提示词
- 📝 支持 Conventional Commits 规范

## 📦 安装

1. 在 VSCode 中搜索 "AI Commit" 并点击 "Install" 按钮。
2. 从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit) 直接安装。

> **Note**\
> 请确保 Node.js 版本 >= 16

## 🤯 使用

1. 确保您已经安装并启用了 `AI Commit` 扩展。
2. 在 `VSCode` 设置中，找到 "ai-commit" 配置项，并根据需要进行配置：
3. 在项目中进行更改并将更改添加到暂存区 (git add)。
4. (可选) 如果您想为提交消息提供额外的上下文，请在点击 AI Commit 按钮之前，在源代码管理面板的消息输入框中输入上下文。
5. 在 `Source Control` 面板的提交消息输入框旁边，单击 `AI Commit` 图标按钮。点击后，扩展将生成 Commit 信息（如果提供了额外上下文，将会考虑在内）并填充到输入框中。
6. 审核生成的 Commit 信息，如果满意，请提交更改。

> **Note**\
> 如果超过最大 token 长度请分批将代码添加到暂存区。

### ⚙️ 配置

> **Note** Version >= 0.0.5 不需要配置 `EMOJI_ENABLED` 和 `FULL_GITMOJI_SPEC`，默认提示词为 [prompt/without_gitmoji.md](./prompt/with_gitmoji.md)，如果不需要使用 `Gitmoji`，请将 `SYSTEM_PROMPT` 设置为您的自定义提示词, 请参考 [prompt/without_gitmoji.md](./prompt/without_gitmoji.md)。

在 `VSCode` 设置中，找到 "ai-commit" 配置项，并根据需要进行配置

| 配置                    |  类型  |            默认            | 必要 |                                                      备注                                                       |
| :---------------------- | :----: | :------------------------: | :--: | :-------------------------------------------------------------------------------------------------------------: |
| AI_PROVIDER             | string |           openai           | Yes  |                                 选择 AI 提供商：`openai`、`gemini` 或 `claude`                                  |
| OPENAI_API_KEY          | string |            None            |  是  |                           [OpenAI 令牌](https://platform.openai.com/account/api-keys)                           |
| OPENAI_BASE_URL         | string |            None            |  否  |             如果使用 Azure，填入：`https://{resource}.openai.azure.com/openai/deployments/{model}`              |
| OPENAI_MODEL            | string |           gpt-4o           |  是  |                     OpenAI 模型，可通过运行 `Show Available OpenAI Models` 命令从列表中选择                     |
| AZURE_API_VERSION       | string |            None            |  否  |                                                Azure API 版本号                                                 |
| OPENAI_TEMPERATURE      | number |            0.7             |  否  |                控制输出随机性。范围：0–2。较低：更集中，较高：更有创造性（仅 Chat Completions）                 |
| OPENAI_API_TYPE         | string |         completion         |  否  |                  选择 API 类型：`completion`（Chat Completions）或 `response`（Responses API）                  |
| OPENAI_REASONING_EFFORT | string |           medium           |  否  |     Responses API 推理强度：`minimal`、`low`、`medium`、`high`。仅在 `OPENAI_API_TYPE` 为 `response` 时生效     |
| OPENAI_TEXT_VERBOSITY   | string |           medium           |  否  |      Responses API 输出详细程度：`low`（~1000 tokens）、`medium`（~4000 tokens）、`high`（~16000 tokens）       |
| GEMINI_API_KEY          | string |            None            |  是  |          `AI_PROVIDER` 为 `gemini` 时必填。[Gemini API key](https://makersuite.google.com/app/apikey)           |
| GEMINI_MODEL            | string |    gemini-2.0-flash-001    |  是  |                                                Gemini 使用的模型                                                |
| GEMINI_TEMPERATURE      | number |            0.7             |  否  |                            控制输出随机性。范围：0–2。较低：更集中，较高：更有创造性                            |
| CLAUDE_API_KEY          | string |            None            |  否  | Anthropic API 密钥。留空可使用 Claude CLI（通过 `claude setup-token` 认证）。`AI_PROVIDER` 为 `claude` 时需配置 |
| CLAUDE_MODEL            | string | claude-sonnet-4-5-20250929 |  否  |                                                Claude 使用的模型                                                |
| CLAUDE_TEMPERATURE      | number |            0.7             |  否  |                                            控制输出随机性。范围：0–1                                            |
| AI_COMMIT_LANGUAGE      | string |          English           |  是  |                                                 支持 20 种语言                                                  |
| SYSTEM_PROMPT           | string |            None            |  否  |                                                自定义系统提示词                                                 |

## ⌨️ 本地开发

可以使用 Github Codespaces 进行在线开发：

[![][github-codespace-shield]][github-codespace-link]

或者，可以克隆存储库并运行以下命令进行本地开发：

```bash
$ git clone https://github.com/sitoi/ai-commit.git
$ cd ai-commit
$ npm install
```

在 VSCode 中打开项目文件夹。按 F5 键运行项目。会弹出一个新的 Extension Development Host 窗口，并在其中启动插件。

## 🤝 参与贡献

我们非常欢迎各种形式的贡献。如果你对贡献代码感兴趣，可以查看我们的 GitHub [Issues][github-issues-link]，大展身手，向我们展示你的奇思妙想。

[![][pr-welcome-shield]][pr-welcome-link]

### 💗 感谢我们的贡献者

[![][github-contrib-shield]][github-contrib-link]

## 🔗 链接

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
[total-installs-shield]: https://img.shields.io/vscode-marketplace/d/Sitoi.ai-commit.svg?&labelColor=black&style=flat-square
[avarage-rating-link]: https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit
[avarage-rating-shield]: https://img.shields.io/vscode-marketplace/r/Sitoi.ai-commit.svg?color=green&labelColor=black&style=flat-square
