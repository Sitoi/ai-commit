import { errMsg, infoMsg } from './utils';
import { generateCommitMsg } from './generate-commit-msg';
export default async function aiCommitController(arg) {
  try {
    infoMsg('Generating commit message...');
    await generateCommitMsg(arg);
  } catch (error) {
    errMsg('Generate commit message failed', error);
  }
}
