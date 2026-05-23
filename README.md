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

- 🔌 **Pluggable providers** — OpenAI (Chat Completions & Responses API), Anthropic Claude, Google Gemini, and **local Ollama** out of the box.
- 🚀 **OpenAI-compatible presets** — one click to switch to DeepSeek / Zhipu GLM / Qwen (DashScope) / Groq / OpenRouter via `AI Commit: Use OpenAI-Compatible Preset`.
- 📡 **Streaming output** — commit message is written into the SCM input box character-by-character as it generates.
- ✋ **Real cancellation** — pressing the progress notification's Cancel button truly aborts the in-flight API request (`AbortController`).
- 🔐 **SecretStorage** — API keys live in VS Code's OS-backed secret store, not your `settings.json`. Existing settings are migrated automatically.
- 🧹 **Smart diff** — lock files, `dist/`, `build/`, `.min.*`, and other generated files are excluded by default; oversized diffs are auto-truncated to a configurable token budget.
- 🧠 **Responses API** — configurable reasoning effort and output verbosity.
- 🌐 **19 languages** for commit message output.
- 😜 **Gitmoji** + Conventional Commits, plus custom system prompts.

## 📦 Installation

1. Search for "AI Commit" in VSCode and click "Install".
2. Or install from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit).

> **Note**: Requires Node.js >= 18 and VS Code >= 1.77.

## 🤯 Usage

1. Run `AI Commit: Set API Key` from the Command Palette and pick a provider. The key is stored in SecretStorage.
2. (Optional) For non-OpenAI vendors that share the OpenAI protocol, run `AI Commit: Use OpenAI-Compatible Preset` to pre-fill the base URL and a recommended model.
3. Stage some changes (`git add ...`).
4. Click the **AI Commit** icon in the Source Control panel header.
5. Watch the commit message stream into the input box. Review, edit if needed, commit.

## 🛠️ Commands

| Command | Purpose |
| --- | --- |
| `AI Commit` (SCM title button) | Generate a commit message from staged changes |
| `AI Commit: Set API Key` | Store an OpenAI/Claude/Gemini key in SecretStorage |
| `AI Commit: Use OpenAI-Compatible Preset` | Pre-configure DeepSeek/Zhipu/Qwen/Groq/OpenRouter |
| `AI Commit: Show Available OpenAI Models` | Pick from `/v1/models` |

## 🧪 Diff handling

| Built-in exclude | Pattern |
| --- | --- |
| Lock files | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `Pipfile.lock`, `poetry.lock`, `composer.lock`, `Gemfile.lock`, `go.sum`, `bun.lockb` |
| Generated output | `dist/`, `build/`, `out/`, `.next/`, `node_modules/` |
| Minified | `*.min.{js,css,map}` |

Customize via `ai-commit.DIFF_EXCLUDE_PATTERNS` (additional regexes) and `ai-commit.DIFF_INCLUDE_DEFAULT_EXCLUDES` (toggle defaults). Token budget is controlled by `ai-commit.DIFF_MAX_TOKENS` (default `8000`).

### ⚙️ Configuration

> The Gitmoji-enabled prompt is built in; to disable Gitmoji or customize the output format, paste a custom prompt into `AI_COMMIT_SYSTEM_PROMPT` (see [prompt/with_gitmoji.md](./prompt/with_gitmoji.md) and [prompt/without_gitmoji.md](./prompt/without_gitmoji.md) for reference templates).

In the VSCode settings, locate the "ai-commit" configuration options and configure them as needed:

| Configuration                       | Type      | Default                       | Notes |
| ----------------------------------- | --------- | ----------------------------- | ----- |
| `AI_PROVIDER`                       | string    | `openai`                      | `openai` / `gemini` / `claude` / `ollama` |
| `OPENAI_API_KEY`                    | string    | `""`                          | Deprecated — prefer `AI Commit: Set API Key` (SecretStorage) |
| `OPENAI_BASE_URL`                   | string    | `""`                          | Azure or OpenAI-compatible vendor (DeepSeek/Zhipu/Qwen/Groq/OpenRouter). Use the preset command for one-click setup |
| `OPENAI_MODEL`                      | string    | `gpt-4o`                      | Run `AI Commit: Show Available OpenAI Models` to discover |
| `AZURE_API_VERSION`                 | string    | `""`                          | Azure API version |
| `OPENAI_TEMPERATURE`                | number    | `0.7`                         | 0–2; Chat Completions only |
| `OPENAI_API_TYPE`                   | enum      | `completion`                  | `completion` or `response` (Responses API) |
| `OPENAI_REASONING_EFFORT`           | enum      | `medium`                      | `minimal`/`low`/`medium`/`high` (Responses API) |
| `OPENAI_TEXT_VERBOSITY`             | enum      | `medium`                      | Maps to max output tokens (Responses API) |
| `GEMINI_API_KEY`                    | string    | `""`                          | Deprecated — use `AI Commit: Set API Key` |
| `GEMINI_MODEL`                      | string    | `gemini-2.0-flash-001`        | |
| `GEMINI_TEMPERATURE`                | number    | `0.7`                         | 0–2 |
| `CLAUDE_API_KEY`                    | string    | `""`                          | Deprecated — use `AI Commit: Set API Key` |
| `CLAUDE_MODEL`                      | string    | `claude-sonnet-4-5-20250929`  | |
| `CLAUDE_TEMPERATURE`                | number    | `0.7`                         | 0–1 |
| `OLLAMA_BASE_URL`                   | string    | `http://localhost:11434/v1`   | Local Ollama OpenAI-compatible endpoint |
| `OLLAMA_MODEL`                      | string    | `llama3.2`                    | Any pulled local model |
| `OLLAMA_TEMPERATURE`                | number    | `0.7`                         | 0–2 |
| `STREAMING_ENABLED`                 | boolean   | `true`                        | Stream output into the SCM input box |
| `DIFF_MAX_TOKENS`                   | number    | `8000`                        | Approx token budget for the diff |
| `DIFF_EXCLUDE_PATTERNS`             | string[]  | `[]`                          | Extra regex patterns to exclude (added to defaults) |
| `DIFF_INCLUDE_DEFAULT_EXCLUDES`     | boolean   | `true`                        | Toggle the built-in exclude list |
| `AI_COMMIT_LANGUAGE`                | enum      | `English`                     | 19 supported languages |
| `AI_COMMIT_SYSTEM_PROMPT`           | string    | `""`                          | Custom system prompt that overrides the default |

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Alternatively, you can clone the repository and run the following commands for local development:

```bash
$ git clone https://github.com/sitoi/ai-commit.git
$ cd ai-commit
$ npm install
$ npm run verify    # typecheck + unit tests
$ npm run build     # webpack production bundle
```

Open the project folder in VSCode. Press F5 to run the project. This opens a new Extension Development Host window with the plugin loaded.

### Running tests

```bash
$ npm run test:unit          # vitest run
$ npm run test:unit:watch    # watch mode
$ npm run test:coverage      # with v8 coverage report
$ npm run lint               # eslint flat config
$ npm run typecheck          # strict tsc
```

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
