# Changelog

All notable changes to **AI Commit** are documented here.

## Unreleased

### Added

- **Pluggable Provider architecture** — `LLMProvider` interface, `AbstractLLMProvider` base class, and factory dispatch. Adding a new provider is now a single new file plus one factory entry.
- **Ollama Provider** — first-class local model support via `http://localhost:11434/v1`. Configurable model, temperature, and base URL.
- **OpenAI-compatible presets** — new command `AI Commit: Use OpenAI-Compatible Preset` for DeepSeek, Zhipu GLM, Qwen (DashScope), Groq, and OpenRouter (one-click `OPENAI_BASE_URL` + recommended model + API key prompt).
- **Streaming output** — generation streams into the SCM input box character-by-character. Toggle with `STREAMING_ENABLED` (default on).
- **Real cancellation** — the progress notification's Cancel button now aborts the in-flight API request via `AbortController` bridged to `CancellationToken`.
- **SecretStorage migration** — API keys are stored in VS Code's OS-backed SecretStorage. One-time migration of existing settings runs on activation.
- **New command `AI Commit: Set API Key`** — interactive picker + password input.
- **Diff processor** — built-in exclusion of lock files (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `Pipfile.lock`, `poetry.lock`, `composer.lock`, `Gemfile.lock`, `go.sum`, `bun.lockb`), `dist/`, `build/`, `out/`, `.next/`, `node_modules/`, and `*.min.{js,css,map}`. Token-budgeted truncation prevents context overruns. Customizable via `DIFF_MAX_TOKENS`, `DIFF_EXCLUDE_PATTERNS`, `DIFF_INCLUDE_DEFAULT_EXCLUDES`.
- **Unit test suite** — `vitest` with 36 tests covering providers, diff processor, presets, redaction, and the `<think>` cleaner.
- **CI workflow** — GitHub Actions matrix (Node 18.x, 20.x) running lint, typecheck, unit tests, and build on push/PR.
- **TypeScript strict mode** — `strict: true`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`.
- **Logger secret redaction** — common API key prefixes (`sk-`, `sk-ant-`, `AIza`, `gsk_`, `xai-`) are masked in Output channel logs.

### Fixed

- **Gemini system prompt loss** — previously the system message was flattened into `sendMessage` and silently dropped. Now passed as `systemInstruction` per the official Google SDK contract. Regression test added.
- **Bogus null return value in `git-utils`** — `error: null` (which conflicted with the `error?: string` signature) is removed; success path now omits `error` entirely.
- **Conflicting `resolutions["@types/node"]: 16.x`** — removed; the project's `devDependencies` `@types/node: 25.x` now takes effect.
- **Empty OpenAI response handling** — non-null assertion replaced with an explicit empty-response guard.
- **Retry loop** — `Failed` modal now caps Retry attempts at 3 per command, then prompts the user to set the API key or open settings.
- **Activation event** — switched from the never-triggered `onCommand:ai-commit` to `onStartupFinished` so the SCM button is active when the user opens a repo.

### Changed

- `tsconfig` target & lib bumped to `ES2022` (required for `Error({ cause })`).
- ESLint migrated from `.eslintrc.json` to flat `eslint.config.mjs` (ESLint v10 compatibility).
- `engines.node` raised to `>= 18`.
- `Error` instances thrown from provider failures now attach the original error as `cause`.
- The deprecated settings-based API key fields (`OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`) are kept for back-compat but marked deprecated in descriptions.

## 0.1.2

Last published version under the original architecture. See git history.
