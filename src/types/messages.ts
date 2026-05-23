export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GenerateOptions {
  signal?: AbortSignal;
  onToken?: (chunk: string) => void;
}
