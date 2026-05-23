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

- 🔌 **可插拔的 Provider 架构** —— 内置 OpenAI（Chat Completions 与 Responses API）、Anthropic Claude、Google Gemini、本地 **Ollama**
- 🚀 **OpenAI 兼容预设** —— 一键切换到 DeepSeek / 智谱 GLM / 通义 (DashScope) / Groq / OpenRouter，命令 `AI Commit: Use OpenAI-Compatible Preset`
- 📡 **流式输出** —— 提交信息以"打字机"形式逐字写入 SCM 输入框
- ✋ **真正的取消** —— 点击进度通知上的取消按钮会通过 `AbortController` 立即中止 API 请求
- 🔐 **SecretStorage** —— API key 存入 VSCode 系统密钥库，不再写在 `settings.json`，旧设置启动时自动迁移
- 🧹 **智能 diff** —— 默认排除 lock 文件、`dist/`、`build/`、`.min.*` 等噪声；超大 diff 自动按 token 预算截断
- 🧠 **Responses API** —— 可配置 reasoning effort 与输出 verbosity
- 🌐 **19 种语言**的提交信息
- 😜 **Gitmoji** + Conventional Commits + 自定义系统提示词

## 📦 安装

1. 在 VSCode 中搜索 "AI Commit" 并点击 "Install"。
2. 或从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit) 安装。

> **Note**：需要 Node.js >= 18，VS Code >= 1.77。

## 🤯 使用

1. 在命令面板运行 `AI Commit: Set API Key` 选择 Provider 输入密钥，密钥会存入 SecretStorage。
2. （可选）对于使用 OpenAI 协议的国产 / 第三方模型，运行 `AI Commit: Use OpenAI-Compatible Preset` 一键配置 baseURL + 推荐模型。
3. 暂存改动 (`git add ...`)。
4. 点击源代码管理面板标题栏的 **AI Commit** 图标按钮。
5. 观察提交信息流式写入输入框，按需修改后提交。

## 🛠️ 命令

| 命令 | 用途 |
| --- | --- |
| `AI Commit`（SCM 标题按钮） | 根据暂存改动生成提交信息 |
| `AI Commit: Set API Key` | 把 OpenAI / Claude / Gemini 的密钥写入 SecretStorage |
| `AI Commit: Use OpenAI-Compatible Preset` | 一键配置 DeepSeek / 智谱 / 通义 / Groq / OpenRouter |
| `AI Commit: Show Available OpenAI Models` | 从 `/v1/models` 拉取并选择模型 |

## 🧪 Diff 处理

| 内置排除 | 模式 |
| --- | --- |
| Lock 文件 | `package-lock.json`、`pnpm-lock.yaml`、`yarn.lock`、`Cargo.lock`、`Pipfile.lock`、`poetry.lock`、`composer.lock`、`Gemfile.lock`、`go.sum`、`bun.lockb` |
| 生成产物 | `dist/`、`build/`、`out/`、`.next/`、`node_modules/` |
| 压缩文件 | `*.min.{js,css,map}` |

可以通过 `ai-commit.DIFF_EXCLUDE_PATTERNS`（追加正则）和 `ai-commit.DIFF_INCLUDE_DEFAULT_EXCLUDES`（关掉默认）来定制。Token 预算由 `ai-commit.DIFF_MAX_TOKENS` 控制（默认 `8000`）。

### ⚙️ 配置

> 默认提示词已内置 Gitmoji；若要关闭 Gitmoji 或自定义输出格式，把自定义内容贴到 `AI_COMMIT_SYSTEM_PROMPT`（参考模板见 [prompt/with_gitmoji.md](./prompt/with_gitmoji.md) 和 [prompt/without_gitmoji.md](./prompt/without_gitmoji.md)）。

| 配置项                              | 类型      | 默认值                        | 备注 |
| ----------------------------------- | --------- | ----------------------------- | ---- |
| `AI_PROVIDER`                       | string    | `openai`                      | `openai` / `gemini` / `claude` / `ollama` |
| `OPENAI_API_KEY`                    | string    | `""`                          | 已废弃 —— 请用 `AI Commit: Set API Key`（SecretStorage） |
| `OPENAI_BASE_URL`                   | string    | `""`                          | Azure 或 OpenAI 兼容厂商（DeepSeek / 智谱 / 通义 / Groq / OpenRouter）。建议用预设命令一键设置 |
| `OPENAI_MODEL`                      | string    | `gpt-4o`                      | 运行 `AI Commit: Show Available OpenAI Models` 可从列表选择 |
| `AZURE_API_VERSION`                 | string    | `""`                          | Azure API 版本 |
| `OPENAI_TEMPERATURE`                | number    | `0.7`                         | 0–2；仅 Chat Completions |
| `OPENAI_API_TYPE`                   | enum      | `completion`                  | `completion` 或 `response`（Responses API） |
| `OPENAI_REASONING_EFFORT`           | enum      | `medium`                      | `minimal`/`low`/`medium`/`high`（仅 Responses API） |
| `OPENAI_TEXT_VERBOSITY`             | enum      | `medium`                      | 映射到最大输出 tokens（仅 Responses API） |
| `GEMINI_API_KEY`                    | string    | `""`                          | 已废弃 —— 请用 `AI Commit: Set API Key` |
| `GEMINI_MODEL`                      | string    | `gemini-2.0-flash-001`        | |
| `GEMINI_TEMPERATURE`                | number    | `0.7`                         | 0–2 |
| `CLAUDE_API_KEY`                    | string    | `""`                          | 已废弃 —— 请用 `AI Commit: Set API Key` |
| `CLAUDE_MODEL`                      | string    | `claude-sonnet-4-5-20250929`  | |
| `CLAUDE_TEMPERATURE`                | number    | `0.7`                         | 0–1 |
| `OLLAMA_BASE_URL`                   | string    | `http://localhost:11434/v1`   | 本地 Ollama 的 OpenAI 兼容端点 |
| `OLLAMA_MODEL`                      | string    | `llama3.2`                    | 任何已拉取的本地模型 |
| `OLLAMA_TEMPERATURE`                | number    | `0.7`                         | 0–2 |
| `STREAMING_ENABLED`                 | boolean   | `true`                        | 流式写入 SCM 输入框 |
| `DIFF_MAX_TOKENS`                   | number    | `8000`                        | 送给模型的 diff 的最大约略 token 数 |
| `DIFF_EXCLUDE_PATTERNS`             | string[]  | `[]`                          | 在内置规则之上额外排除的正则 |
| `DIFF_INCLUDE_DEFAULT_EXCLUDES`     | boolean   | `true`                        | 启用内置默认排除列表 |
| `AI_COMMIT_LANGUAGE`                | enum      | `English`                     | 支持 19 种语言 |
| `AI_COMMIT_SYSTEM_PROMPT`           | string    | `""`                          | 覆盖默认系统提示词的自定义内容 |

## ⌨️ 本地开发

可以使用 Github Codespaces 进行在线开发：

[![][github-codespace-shield]][github-codespace-link]

或者，可以克隆存储库并运行以下命令进行本地开发：

```bash
$ git clone https://github.com/sitoi/ai-commit.git
$ cd ai-commit
$ npm install
$ npm run verify    # 类型检查 + 单元测试
$ npm run build     # webpack 生产构建
```

在 VSCode 中打开项目文件夹。按 F5 键运行项目。会弹出一个新的 Extension Development Host 窗口，并在其中启动插件。

### 跑测试

```bash
$ npm run test:unit          # vitest 单测
$ npm run test:unit:watch    # watch 模式
$ npm run test:coverage      # v8 覆盖率报告
$ npm run lint               # eslint 扁平配置
$ npm run typecheck          # 严格 tsc
```

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
