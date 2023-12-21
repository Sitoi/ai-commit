import { getDiffStaged } from './git-utils';
import { ConfigKeys, getConfig } from './config';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
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
