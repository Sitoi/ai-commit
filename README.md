# AI Commit: A VSCode Extension

AI Commit is a Visual Studio Code extension designed to automatically generate commit messages conforming to the Conventional Commit specification by examining changes in the Git staging area. This extension is ideal for developers seeking to streamline the process of generating commit messages and adhere to a unified standard.

![](https://github.com/sitoi/ai-commit/blob/main/aicommit.gif?raw=true)

## Features

- Supports OpenAI API
- Supports Azure API
- Supports 19 languages
- Supports GitEmoji
- Adheres to the Conventional Commit specification

## Installation

Search for "AI Commit" in VSCode and click the "Install" button, or directly install it from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sitoi.ai-commit).

## Usage

1. Ensure you have installed and enabled the AI Commit extension.
2. In the VSCode settings, locate the "ai-commit" configuration and customize it as needed.
3. Make changes in your project and add the changes to the staging area (git add).
4. Next to the commit message input box in the "Source Control" panel, click the "AI Commit" icon button. After clicking, the extension will generate a commit message and populate it in the input box.
5. Review the generated commit message, and if satisfied, proceed to commit your changes.

## Configuration

| Configuration      |  Type   |    Default    | Required |                                         Remarks                                          |
| :----------------- | :-----: | :-----------: | :------: | :--------------------------------------------------------------------------------------: |
| OPENAI_API_KEY     | string  |     None      |   Yes    |                                      OpenAI API Key                                      |
| OPENAI_BASE_URL    | string  |     None      |    No    |   If using Azure, use: https://{resource}.openai.azure.com/openai/deployments/{model}    |
| OPENAI_MODEL       | string  | gpt-3.5-turbo |   Yes    |                                       OpenAI MODEL                                       |
| AZURE_API_VERSION  | string  |     None      |    No    |                                    AZURE_API_VERSION                                     |
| AI_COMMIT_LANGUAGE | string  |      en       |   Yes    |                                  Supports 19 languages                                   |
| EMOJI_ENABLED      | boolean |     true      |   Yes    |                                   Enable Emoji Support                                   |
| FULL_GITMOJI_SPEC  | boolean |     false     |    No    | Enable complete GitEmoji specification, see [https://gitmoji.dev/](https://gitmoji.dev/) |

## Contribution

We welcome contributions to this project! Please submit issue reports or initiate pull requests on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).
