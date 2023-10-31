# AI Commit: A VSCode Extension

AI Commit 是一个 Visual Studio Code 扩展，用于通过检查 Git 暂存区的改动，自动生成符合 Conventional Commit 规范的 commit 信息。该扩展适合希望简化提交消息生成流程并遵循统一规范的开发者。

![](https://github.com/sitoi/ai-commit/blob/main/aicommit.gif?raw=true)

## 特性

- 支持 OpenAI API
- 支持 Azure API
- 支持 19 种语言
- 支持 GitEmoji
- 支持 Conventional Commit 规范

## 安装

在 VSCode 中搜索 "AI Commit" 并点击 "Install" 按钮，或从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit) 直接安装。

## 使用

1. 确保您已经安装并启用了 AI-Commit 扩展。
2. 在 VSCode 设置中，找到 "ai-commit" 配置项，并根据需要进行配置：
3. 在项目中进行更改并将更改添加到暂存区 (git add)。
4. 在 "Source Control" 面板的提交消息输入框旁边，单击 "AI Commit" 图标按钮。点击后，扩展将生成 Commit 信息并填充到输入框中。
5. 审核生成的 Commit 信息，如果满意，请提交更改。

## 配置

| 配置               |  类型   |     默认      | 必要 |                                        备注                                        |
| :----------------- | :-----: | :-----------: | :--: | :--------------------------------------------------------------------------------: |
| OPENAI_API_KEY     | string  |     None      |  是  |                                   OpenAI API Key                                   |
| OPENAI_BASE_URL    | string  |     None      |  否  | 如果是 Azure，使用：https://{resource}.openai.azure.com/openai/deployments/{model} |
| OPENAI_MODEL       | string  | gpt-3.5-turbo |  是  |                                    OpenAI MODEL                                    |
| AZURE_API_VERSION  | string  |     None      |  否  |                                 AZURE_API_VERSION                                  |
| AI_COMMIT_LANGUAGE | string  |      en       |  是  |                                   支持 19 种语言                                   |
| EMOJI_ENABLED      | boolean |     true      |  是  |                                   是否开启 Emoji                                   |
| FULL_GITMOJI_SPEC  | boolean |     false     |  否  |  是否开启完整的 GitEmoji 规范，参考 [https://gitmoji.dev/](https://gitmoji.dev/)   |

## 贡献

本项目欢迎您的贡献！请在 GitHub 上提交问题报告或发起合并请求。

## 许可

项目使用 [MIT 许可证](LICENSE)。
