/**
 * Minimal stub of the `vscode` module so unit tests can import production code
 * without spinning up an Extension Host.
 */

const configStore = new Map<string, unknown>();

export const ConfigurationTarget = {
  Global: 1 as const,
  Workspace: 2 as const,
  WorkspaceFolder: 3 as const
};

export const ProgressLocation = {
  SourceControl: 1 as const,
  Window: 10 as const,
  Notification: 15 as const
};

class FakeConfig {
  get<T>(key: string, defaultValue?: T): T {
    return (configStore.get(`ai-commit.${key}`) as T) ?? (defaultValue as T);
  }
  async update(key: string, value: unknown) {
    configStore.set(`ai-commit.${key}`, value);
  }
}

export const workspace = {
  getConfiguration(_section?: string) {
    return new FakeConfig();
  },
  onDidChangeConfiguration(_listener: unknown) {
    return { dispose() {} };
  },
  workspaceFolders: undefined as undefined | Array<{ uri: { fsPath: string } }>
};

export const window = {
  withProgress: async <T>(_opts: unknown, task: (p: unknown, t: unknown) => Promise<T>) =>
    task({ report: () => undefined }, { isCancellationRequested: false, onCancellationRequested: () => ({ dispose() {} }) }),
  showInformationMessage: async () => undefined,
  showWarningMessage: async () => undefined,
  showErrorMessage: async () => undefined,
  showInputBox: async () => undefined,
  showQuickPick: async () => undefined,
  createOutputChannel: () => ({
    appendLine: () => undefined,
    show: () => undefined,
    dispose: () => undefined
  })
};

export const commands = {
  registerCommand: () => ({ dispose() {} }),
  executeCommand: async () => undefined
};

export const extensions = {
  getExtension: () => undefined
};

class FakeUri {
  constructor(public fsPath: string) {}
}
export const Uri = {
  file: (p: string) => new FakeUri(p)
};

export type Disposable = { dispose(): void };

export const __testHelpers = {
  setConfig(key: string, value: unknown) {
    configStore.set(`ai-commit.${key}`, value);
  },
  clearConfig() {
    configStore.clear();
  }
};
