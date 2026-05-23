import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { ConfigKeys } from '../config';
import type { ChatMessage, GenerateOptions } from '../types/messages';
import { AbstractLLMProvider } from './base';
import type { ProviderContext, ProviderId } from './types';

export class OllamaProvider extends AbstractLLMProvider {
  readonly id: ProviderId = 'ollama';
  readonly displayName = 'Ollama (local)';
  readonly apiKeyConfigKey = ConfigKeys.OLLAMA_BASE_URL;
  readonly requiresApiKey = false;

  constructor(ctx: ProviderContext) {
    super(ctx);
  }

  private get baseURL(): string {
    return (
      this.ctx.config.getConfig<string>(
        ConfigKeys.OLLAMA_BASE_URL,
        'http://localhost:11434/v1'
      ) || 'http://localhost:11434/v1'
    );
  }

  private createClient(): OpenAI {
    return new OpenAI({ apiKey: 'ollama', baseURL: this.baseURL });
  }

  override async validate(): Promise<void> {
    try {
      const res = await fetch(`${this.baseURL.replace(/\/v1$/, '')}/api/tags`, {
        method: 'GET'
      });
      if (!res.ok) {
        throw new Error(`Ollama responded with ${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Cannot reach Ollama at ${this.baseURL}. Make sure 'ollama serve' is running. (${msg})`,
        { cause: err }
      );
    }
  }

  protected async doGenerate(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const client = this.createClient();
    const model = this.ctx.config.getConfig<string>(
      ConfigKeys.OLLAMA_MODEL,
      'llama3.2'
    );
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.OLLAMA_TEMPERATURE,
      0.7
    );

    const completion = await client.chat.completions.create(
      {
        model,
        messages: messages as ChatCompletionMessageParam[],
        temperature
      },
      opts.signal ? { signal: opts.signal } : undefined
    );
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('Ollama returned an empty response');
    return text;
  }

  async *generateStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const client = this.createClient();
    const model = this.ctx.config.getConfig<string>(
      ConfigKeys.OLLAMA_MODEL,
      'llama3.2'
    );
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.OLLAMA_TEMPERATURE,
      0.7
    );

    const stream = await client.chat.completions.create(
      {
        model,
        messages: messages as ChatCompletionMessageParam[],
        temperature,
        stream: true
      },
      opts.signal ? { signal: opts.signal } : undefined
    );
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  async listModels(): Promise<string[]> {
    const res = await fetch(`${this.baseURL.replace(/\/v1$/, '')}/api/tags`);
    if (!res.ok) {
      throw new Error(`Failed to list Ollama models: ${res.status}`);
    }
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    return (data.models ?? []).map((m) => m.name);
  }
}
