export interface DiffProcessOptions {
  maxTokens: number;
  excludePatterns: RegExp[];
}

export interface DiffProcessResult {
  diff: string;
  truncated: boolean;
  excludedFiles: string[];
}

interface FileDiff {
  filePath: string;
  text: string;
}

export const DEFAULT_EXCLUDE_PATTERNS: RegExp[] = [
  /(^|\/)package-lock\.json$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)bun\.lock(b)?$/,
  /(^|\/)Cargo\.lock$/,
  /(^|\/)Pipfile\.lock$/,
  /(^|\/)poetry\.lock$/,
  /(^|\/)composer\.lock$/,
  /(^|\/)Gemfile\.lock$/,
  /(^|\/)go\.sum$/,
  /\.min\.(js|css|map)$/,
  /^dist\//,
  /^build\//,
  /^out\//,
  /^\.next\//,
  /^node_modules\//,
  /\.lock$/
];

const ESTIMATE_CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / ESTIMATE_CHARS_PER_TOKEN);
}

function splitDiffByFile(rawDiff: string): FileDiff[] {
  const lines = rawDiff.split('\n');
  const files: FileDiff[] = [];
  let current: FileDiff | undefined;

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      if (current) files.push(current);
      const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
      const filePath = match?.[2] ?? match?.[1] ?? 'unknown';
      current = { filePath, text: line + '\n' };
    } else if (current) {
      current.text += line + '\n';
    }
  }
  if (current) files.push(current);
  return files;
}

export function processDiff(
  rawDiff: string,
  opts: DiffProcessOptions
): DiffProcessResult {
  if (!rawDiff) {
    return { diff: '', truncated: false, excludedFiles: [] };
  }

  const fileDiffs = splitDiffByFile(rawDiff);
  if (fileDiffs.length === 0) {
    return { diff: rawDiff, truncated: false, excludedFiles: [] };
  }

  const excludedFiles: string[] = [];
  const keptDiffs: FileDiff[] = [];

  for (const fd of fileDiffs) {
    const isExcluded = opts.excludePatterns.some((rx) => rx.test(fd.filePath));
    if (isExcluded) {
      excludedFiles.push(fd.filePath);
    } else {
      keptDiffs.push(fd);
    }
  }

  let total = 0;
  const chunks: string[] = [];
  let truncated = false;
  for (const fd of keptDiffs) {
    const tokens = estimateTokens(fd.text);
    if (total + tokens > opts.maxTokens) {
      truncated = true;
      const remainingTokens = opts.maxTokens - total;
      if (remainingTokens > 200) {
        const sliceChars = remainingTokens * ESTIMATE_CHARS_PER_TOKEN;
        chunks.push(fd.text.slice(0, sliceChars));
      }
      break;
    }
    chunks.push(fd.text);
    total += tokens;
  }

  if (truncated) {
    chunks.push('\n[... diff truncated due to size limit ...]\n');
  }

  return {
    diff: chunks.join('').trim(),
    truncated,
    excludedFiles
  };
}
