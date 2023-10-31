import { errMsg, infoMsg } from './utils';
import { generateCommitMsg } from './generate-commit-msg';
export default async function aiCommitController() {
  try {
    infoMsg('Generating commit message...');
    await generateCommitMsg();
  } catch (error) {
    errMsg('Generate commit message failed', error);
  }
}
