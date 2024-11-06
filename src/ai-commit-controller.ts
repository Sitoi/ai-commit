import { errMsg, infoMsg } from './utils';
import { generateCommitMsg } from './generate-commit-msg';

/**
 * Asynchronously generates a commit message based on the provided argument.
 * 
 * @param {any} arg - The input argument used to generate the commit message.
 * @returns {Promise<void>} - A promise that resolves when the commit message is generated.
 * @throws {Error} - Throws an error if the commit message generation fails.
 */
export default async function aiCommitController(arg) {
  try {
    infoMsg('Generating commit message...');
    await generateCommitMsg(arg);
  } catch (error) {
    errMsg('Generate commit message failed', error);
  }
}
