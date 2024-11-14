import * as fs from 'fs-extra';
import { ChatCompletionMessageParam } from 'openai/resources';
import * as vscode from 'vscode';
import { ConfigKeys, ConfigurationManager } from './config';
import { getDiffStaged } from './git-utils';
import { ChatGPTAPI } from './openai-utils';
import { getMainCommitPrompt } from './prompts';
import { ProgressHandler } from './utils';

/**
 * Generates a chat completion prompt for the commit message based on the provided diff.
 *
 * @param {string} diff - The diff string representing changes to be committed.
 * @returns {Promise<Array<{ role: string, content: string }>>} - A promise that resolves to an array of messages for the chat completion.
 */
const generateCommitMessageChatCompletionPrompt = async (diff: string, extras: string) => {
  const INIT_MESSAGES_PROMPT = await getMainCommitPrompt(extras);
  const chatContextAsCompletionRequest = [...INIT_MESSAGES_PROMPT];

  chatContextAsCompletionRequest.push({
    role: 'user',
    content: diff
  });
  return chatContextAsCompletionRequest;
};

/**
 * Retrieves the repository associated with the provided argument.
 *
 * @param {any} arg - The input argument containing the root URI of the repository.
 * @returns {Promise<vscode.SourceControlRepository>} - A promise that resolves to the repository object.
 */
export async function getRepo(arg) {
  const gitApi = vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1);
  if (!gitApi) {
    throw new Error('Git extension not found');
  }

  if (typeof arg === 'object' && arg.rootUri) {
    const resourceUri = arg.rootUri;
    const realResourcePath: string = fs.realpathSync(resourceUri!.fsPath);
    for (let i = 0; i < gitApi.repositories.length; i++) {
      const repo = gitApi.repositories[i];
      if (realResourcePath.startsWith(repo.rootUri.fsPath)) {
        return repo;
      }
    }
  }
  return gitApi.repositories[0];
}

/**
 * Generates a commit message based on the changes staged in the repository.
 *
 * @param {any} arg - The input argument containing the root URI of the repository.
 * @returns {Promise<void>} - A promise that resolves when the commit message has been generated and set in the SCM input box.
 */
export async function generateCommitMsg(arg) {
  return ProgressHandler.withProgress(
    'Generating commit message...',
    async (progress) => {
      try {
        const configManager = ConfigurationManager.getInstance();
        const repo = await getRepo(arg);
        const apiKey = configManager.getConfig<string>(ConfigKeys.OPENAI_API_KEY);

        if (!apiKey) {
          throw new Error('OpenAI API Key not configured');
        }

        progress.report({ message: 'Getting staged changes...' });
        const { diff, error } = await getDiffStaged(repo);

        if (error) {
          throw new Error(`Failed to get staged changes: ${error}`);
        }

        if (!diff || diff === 'No changes staged.') {
          throw new Error('No changes staged for commit');
        }

        const scmInputBox = repo.inputBox;
        if (!scmInputBox) {
          throw new Error('Unable to find the SCM input box');
        }

        progress.report({ message: 'Analyzing changes...' });
        const extras = scmInputBox.value;
        const messages = await generateCommitMessageChatCompletionPrompt(diff, extras);

        progress.report({ message: 'Generating commit message...' });
        try {
          const commitMessage = await ChatGPTAPI(
            messages as ChatCompletionMessageParam[]
          );
          if (commitMessage) {
            scmInputBox.value = commitMessage;
          } else {
            throw new Error('Failed to generate commit message');
          }
        } catch (err) {
          let errorMessage = 'An unexpected error occurred';

          if (err.response?.status) {
            switch (err.response.status) {
              case 401:
                errorMessage = 'Invalid API key or unauthorized access';
                break;
              case 429:
                errorMessage = 'Rate limit exceeded. Please try again later';
                break;
              case 500:
                errorMessage = 'OpenAI server error. Please try again later';
                break;
              case 503:
                errorMessage = 'OpenAI service is temporarily unavailable';
                break;
            }
          }

          throw new Error(errorMessage);
        }
      } catch (error) {
        throw error;
      }
    }
  );
}
