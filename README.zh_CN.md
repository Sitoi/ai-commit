<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/Sitoi/ai-commit/blob/main/images/logo.png?raw=true">

<h1>AI Commit</h1>

审查 Git 暂存区修改，借助 Azure/OpenAI API 生成规范的 Conventional Commit 消息，简化提交，保持一致规范。

[English](./README.md) · **简体中文** · [报告问题][github-issues-link] · [请求功能][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![](https://github.com/sitoi/ai-commit/blob/main/aicommit.gif?raw=true)

</div>

## ✨ 特性

- [x] 🤯 支持使用 ChatGPT / Azure API 根据 git diffs 自动生成提交信息
- [x] 🗺️ 支持多语言提交信息
- [x] 😜 支持添加 Gitmoji
- [x] 📝 支持 Conventional Commits 规范

## 📦 安装

1. 在 VSCode 中搜索 "AI Commit" 并点击 "Install" 按钮。
2. 从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit) 直接安装。

> **Note**\
> 请确保 Node.js 版本 >= 16

## 🤯 使用

1. 确保您已经安装并启用了 `AI Commit` 扩展。
2. 在 `VSCode` 设置中，找到 "ai-commit" 配置项，并根据需要进行配置：
3. 在项目中进行更改并将更改添加到暂存区 (git add)。
4. 在 `Source Control` 面板的提交消息输入框旁边，单击 `AI Commit` 图标按钮。点击后，扩展将生成 Commit 信息并填充到输入框中。
5. 审核生成的 Commit 信息，如果满意，请提交更改。

> **Note**\
> 如果超过最大 token 长度请分批将代码添加到暂存区。

### ⚙️ 配置

在 `VSCode` 设置中，找到 "ai-commit" 配置项，并根据需要进行配置

| 配置               |  类型   |     默认      | 必要 |                                        备注                                        |
| :----------------- | :-----: | :-----------: | :--: | :--------------------------------------------------------------------------------: |
| OPENAI_API_KEY     | string  |     None      |  是  |            [OpenAI 令牌](https://platform.openai.com/account/api-keys)             |
| OPENAI_BASE_URL    | string  |     None      |  否  | 如果是 Azure，使用：https://{resource}.openai.azure.com/openai/deployments/{model} |
| OPENAI_MODEL       | string  | gpt-3.5-turbo |  是  |                                    OpenAI MODEL                                    |
| AZURE_API_VERSION  | string  |     None      |  否  |                                 AZURE_API_VERSION                                  |
| AI_COMMIT_LANGUAGE | string  |      en       |  是  |                                   支持 19 种语言                                   |
| EMOJI_ENABLED      | boolean |     true      |  是  |                                   是否开启 Emoji                                   |
| FULL_GITMOJI_SPEC  | boolean |     false     |  否  |  是否开启完整的 GitEmoji 规范，参考 [https://gitmoji.dev/](https://gitmoji.dev/)   |

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

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 链接

### Credits

- **auto-commit** - <https://github.com/lynxife/auto-commit>
- **opencommit** - <https://github.com/di-sukharev/opencommit>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

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
