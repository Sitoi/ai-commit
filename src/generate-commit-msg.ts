import { getDiffStaged } from './git-utils';
import { ConfigKeys, getConfig } from './config';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { errMsg, infoMsg } from './utils';
import { ChatGPTAPI } from './openai-utils';
import { getMainCommitPrompt } from './prompts';

/**
 * Generates a chat completion prompt for the commit message based on the provided diff.
 * 
 * @param {string} diff - The diff string representing changes to be committed.
 * @returns {Promise<Array<{ role: string, content: string }>>} - A promise that resolves to an array of messages for the chat completion.
 */
const generateCommitMessageChatCompletionPrompt = async (diff: string) => {
  const INIT_MESSAGES_PROMPT = await getMainCommitPrompt();
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
  const gitApi = vscode.extensions.getExtension('vscode.git').exports.getAPI(1);
  if (typeof arg === 'object' && arg.rootUri) {
    const resourceUri = arg.rootUri;
    const realResourcePath: string = fs.realpathSync(resourceUri!.fsPath);
    let i = 0;
    for (const x of gitApi.repositories) {
      if (
        realResourcePath.startsWith(x.rootUri.fsPath) &&
        x.rootUri.fsPath === gitApi.repositories[i].rootUri.fsPath
      ) {
        return gitApi.repositories[i];
      }
      i++;
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
  const repo = await getRepo(arg);
  const apiKey = getConfig<string>(ConfigKeys.OPENAI_API_KEY);
  const diff = await getDiffStaged(repo);

  if (!apiKey) {
    infoMsg('OpenAI API Key Not Set');
    return;
  }

  infoMsg('gitRootPath: ' + repo.rootUri.fsPath);
  const scmInputBox = repo.inputBox as vscode.SourceControlInputBox;
  const messages = await generateCommitMessageChatCompletionPrompt(diff);
  if (scmInputBox) {
    const edit = new vscode.WorkspaceEdit();

    scmInputBox.value = '';
    ChatGPTAPI(messages)
      .then((res) => {
        scmInputBox.value += res;
      })
      .catch((err) => {
        errMsg('API ERROR: ', err);
      });
    await vscode.workspace.applyEdit(edit);
  } else {
    errMsg('Unable to find the SCM input box.', '');
  }
}
