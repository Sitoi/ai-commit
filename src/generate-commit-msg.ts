import * as fs from 'node:fs';
import * as vscode from 'vscode';
import { ConfigKeys, ConfigurationManager } from './config';
import {
  DEFAULT_EXCLUDE_PATTERNS,
  processDiff,
  type DiffProcessResult
} from './diff-processor';
import { getDiffStaged } from './git-utils';
import { Logger } from './logger';
import { AbstractLLMProvider } from './providers/base';
import { createProvider } from './providers/factory';
import type { LLMProvider } from './providers/types';
import { getMainCommitPrompt } from './prompts';
import type { SecretsManager } from './secrets';
import type { ChatMessage } from './types/messages';
import { createAbortBridge, ProgressHandler } from './utils';

let secretsManagerRef: SecretsManager | undefined;
export function setSecretsManager(secrets: SecretsManager) {
  secretsManagerRef = secrets;
}

async function buildMessages(
  diff: string,
  additionalContext?: string
): Promise<ChatMessage[]> {
  const base = await getMainCommitPrompt();
  const messages: ChatMessage[] = [...base];

  if (additionalContext) {
    messages.push({
      role: 'user',
      content: `Additional context for the changes:\n${additionalContext}`
    });
  }

  messages.push({ role: 'user', content: diff });
  return messages;
}

export async function getRepo(arg: unknown) {
  const gitApi = vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1);
  if (!gitApi) {
    throw new Error('Git extension not found');
  }

  if (
    arg &&
    typeof arg === 'object' &&
    'rootUri' in arg &&
    (arg as { rootUri?: vscode.Uri }).rootUri
  ) {
    const resourceUri = (arg as { rootUri: vscode.Uri }).rootUri;
    try {
      const realResourcePath = fs.realpathSync(resourceUri.fsPath);
      for (const repo of gitApi.repositories) {
        if (realResourcePath.startsWith(repo.rootUri.fsPath)) {
          return repo;
        }
      }
    } catch (err) {
      Logger.warn(
        `Failed to resolve real path for ${resourceUri.fsPath}; falling back to first repository`,
        err
      );
    }
  }
  return gitApi.repositories[0];
}

function buildExcludePatterns(configManager: ConfigurationManager): RegExp[] {
  const includeDefaults = configManager.getConfig<boolean>(
    ConfigKeys.DIFF_INCLUDE_DEFAULT_EXCLUDES,
    true
  );
  const userPatterns =
    configManager.getConfig<string[]>(ConfigKeys.DIFF_EXCLUDE_PATTERNS, []) ?? [];

  const compiled: RegExp[] = [];
  for (const raw of userPatterns) {
    try {
      compiled.push(new RegExp(raw));
    } catch (err) {
      Logger.warn(`Ignoring invalid DIFF_EXCLUDE_PATTERNS entry: ${raw}`, err);
    }
  }
  return includeDefaults ? [...DEFAULT_EXCLUDE_PATTERNS, ...compiled] : compiled;
}

async function runStreamingGeneration(
  provider: LLMProvider,
  messages: ChatMessage[],
  scmInputBox: { value: string },
  signal: AbortSignal
): Promise<string> {
  if (!provider.generateStream) {
    return provider.generate(messages, { signal });
  }
  scmInputBox.value = '';
  let buffer = '';
  for await (const chunk of provider.generateStream(messages, { signal })) {
    buffer += chunk;
    scmInputBox.value = AbstractLLMProvider.cleanThinkTags(buffer);
  }
  return AbstractLLMProvider.cleanThinkTags(buffer);
}

function reportDiffStats(
  progress: vscode.Progress<{ message?: string }>,
  result: DiffProcessResult
) {
  if (result.excludedFiles.length > 0) {
    Logger.info(`Excluded ${result.excludedFiles.length} file(s) from diff:`);
    for (const file of result.excludedFiles) Logger.info(`  - ${file}`);
  }
  if (result.truncated) {
    progress.report({ message: 'Diff was large; truncated to fit token budget.' });
    Logger.warn('Diff truncated due to DIFF_MAX_TOKENS limit');
  }
}

export async function generateCommitMsg(arg: unknown) {
  return ProgressHandler.withProgress('', async (progress, token) => {
    const configManager = ConfigurationManager.getInstance();
    const secrets = secretsManagerRef;
    if (!secrets) {
      throw new Error('SecretsManager not initialized');
    }

    const repo = await getRepo(arg);
    const provider = createProvider({
      config: configManager,
      secrets,
      logger: Logger
    });
    Logger.info(`Using AI provider: ${provider.id}`);

    progress.report({ message: 'Getting staged changes...' });
    const { diff: rawDiff, error } = await getDiffStaged(repo);

    if (error) {
      throw new Error(`Failed to get staged changes: ${error}`);
    }
    if (!rawDiff || rawDiff === 'No changes staged.') {
      throw new Error('No changes staged for commit');
    }

    const maxTokens = configManager.getConfig<number>(
      ConfigKeys.DIFF_MAX_TOKENS,
      8000
    );
    const excludePatterns = buildExcludePatterns(configManager);
    const processed = processDiff(rawDiff, { maxTokens, excludePatterns });
    reportDiffStats(progress, processed);

    if (!processed.diff) {
      throw new Error(
        'After filtering, no diff content remained. All changed files matched exclude patterns.'
      );
    }

    const scmInputBox = repo.inputBox;
    if (!scmInputBox) {
      throw new Error('Unable to find the SCM input box');
    }

    const additionalContext = scmInputBox.value.trim();
    progress.report({
      message: additionalContext
        ? 'Analyzing changes with additional context...'
        : 'Analyzing changes...'
    });

    const messages = await buildMessages(processed.diff, additionalContext);
    const streamingEnabled = configManager.getConfig<boolean>(
      ConfigKeys.STREAMING_ENABLED,
      true
    );

    progress.report({
      message: streamingEnabled
        ? 'Streaming commit message...'
        : 'Generating commit message...'
    });

    const bridge = createAbortBridge(token);
    try {
      await provider.validate();
      const commitMessage = streamingEnabled
        ? await runStreamingGeneration(provider, messages, scmInputBox, bridge.signal)
        : await provider.generate(messages, { signal: bridge.signal });

      if (!commitMessage) {
        throw new Error('Failed to generate commit message');
      }
      scmInputBox.value = commitMessage;
      Logger.info('Commit message generated successfully');
    } catch (err) {
      if (token.isCancellationRequested) {
        Logger.info('Generation cancelled by user');
        return;
      }
      Logger.error(`${provider.id} API call failed:`, err);
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      bridge.dispose();
    }
  });
}
