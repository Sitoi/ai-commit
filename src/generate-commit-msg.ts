import { getDiffStaged } from './git-utils';
import { ConfigKeys, getConfig } from './config';
import * as vscode from 'vscode';
import { errMsg, infoMsg } from './utils';
import { ChatGPTAPI } from './openai-utils';
import { getMainCommitPrompt } from './prompts';

const generateCommitMessageChatCompletionPrompt = async (diff: string) => {
  const INIT_MESSAGES_PROMPT = await getMainCommitPrompt();
  const chatContextAsCompletionRequest = [...INIT_MESSAGES_PROMPT];

  chatContextAsCompletionRequest.push({
    role: 'user',
    content: diff
  });
  return chatContextAsCompletionRequest;
};

export async function generateCommitMsg() {
  const diff = await getDiffStaged();
  const apiKey = getConfig<string>(ConfigKeys.OPENAI_API_KEY);

  if (!apiKey) {
    infoMsg('OpenAI API Key Not Set');
    return;
  }

  const sourceControlView = vscode.extensions
    .getExtension('vscode.git')
    .exports.getAPI(1).repositories[0];

  const scmInputBox = sourceControlView.inputBox as vscode.SourceControlInputBox;
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
    vscode.window.showErrorMessage('Unable to find the SCM input box.');
  }
}
