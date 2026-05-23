import Anthropic from '@anthropic-ai/sdk';
import { ConfigKeys } from '../config';
import type { ChatMessage, GenerateOptions } from '../types/messages';
import { AbstractLLMProvider } from './base';
import type { ProviderId } from './types';

export class ClaudeProvider extends AbstractLLMProvider {
  readonly id: ProviderId = 'claude';
  readonly displayName = 'Claude';
  readonly apiKeyConfigKey = ConfigKeys.CLAUDE_API_KEY;

  private async createClient(): Promise<Anthropic> {
    const apiKey = await this.resolveApiKey();
    return new Anthropic({ apiKey });
  }

  private splitMessages(messages: ChatMessage[]) {
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversation = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
    return { system: systemMessage?.content, conversation };
  }

  protected async doGenerate(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const anthropic = await this.createClient();
    const model = this.ctx.config.getConfig<string>(
      ConfigKeys.CLAUDE_MODEL,
      'claude-sonnet-4-5'
    );
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.CLAUDE_TEMPERATURE,
      0.7
    );

    const { system, conversation } = this.splitMessages(messages);

    try {
      const response = await anthropic.messages.create(
        {
          model,
          max_tokens: 1024,
          temperature,
          system,
          messages: conversation
        },
        opts.signal ? { signal: opts.signal } : undefined
      );

      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        return textBlock.text;
      }
      throw new Error('Claude returned no text content');
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Claude API error: ${err.message}`, { cause: err });
      }
      throw new Error('Claude API error: unknown failure', { cause: err });
    }
  }

  async *generateStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const anthropic = await this.createClient();
    const model = this.ctx.config.getConfig<string>(
      ConfigKeys.CLAUDE_MODEL,
      'claude-sonnet-4-5'
    );
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.CLAUDE_TEMPERATURE,
      0.7
    );
    const { system, conversation } = this.splitMessages(messages);

    const stream = anthropic.messages.stream(
      {
        model,
        max_tokens: 1024,
        temperature,
        system,
        messages: conversation
      },
      opts.signal ? { signal: opts.signal } : undefined
    );

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
