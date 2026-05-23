import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import type { ReasoningEffort } from 'openai/resources/shared';
import { ConfigKeys } from '../config';
import type { ChatMessage, GenerateOptions } from '../types/messages';
import { AbstractLLMProvider } from './base';
import type { ProviderContext, ProviderId } from './types';

interface OpenAIClientConfig {
  apiKey: string;
  baseURL?: string;
  defaultQuery?: { 'api-version': string };
  defaultHeaders?: { 'api-key': string };
}

function buildClientConfig(ctx: ProviderContext, apiKey: string): OpenAIClientConfig {
  const baseURL = ctx.config.getConfig<string>(ConfigKeys.OPENAI_BASE_URL);
  const apiVersion = ctx.config.getConfig<string>(ConfigKeys.AZURE_API_VERSION);

  const cfg: OpenAIClientConfig = { apiKey };
  if (baseURL) {
    cfg.baseURL = baseURL;
    if (apiVersion) {
      cfg.defaultQuery = { 'api-version': apiVersion };
      cfg.defaultHeaders = { 'api-key': apiKey };
    }
  }
  return cfg;
}

/**
 * Helper used by ConfigurationManager.updateOpenAIModelList(). Reads
 * the API key via SecretsManager first, falling back to settings.
 */
export async function createOpenAIClient(ctx: ProviderContext): Promise<OpenAI> {
  const fromSecrets = await ctx.secrets.getApiKey('openai');
  const fromSettings = ctx.config.getConfig<string>(ConfigKeys.OPENAI_API_KEY);
  const apiKey = (fromSecrets || fromSettings || '').trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Run "AI Commit: Set API Key".');
  }
  return new OpenAI(buildClientConfig(ctx, apiKey));
}

export class OpenAIProvider extends AbstractLLMProvider {
  readonly id: ProviderId = 'openai';
  readonly displayName = 'OpenAI';
  readonly apiKeyConfigKey = ConfigKeys.OPENAI_API_KEY;

  private async createClient(): Promise<OpenAI> {
    const apiKey = await this.resolveApiKey();
    return new OpenAI(buildClientConfig(this.ctx, apiKey));
  }

  protected async doGenerate(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const apiType = this.ctx.config.getConfig<string>(
      ConfigKeys.OPENAI_API_TYPE,
      'completion'
    );
    return apiType === 'response'
      ? this.callResponsesAPI(messages, opts)
      : this.callChatCompletions(messages, opts);
  }

  private async callChatCompletions(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const openai = await this.createClient();
    const model = this.ctx.config.getConfig<string>(ConfigKeys.OPENAI_MODEL);
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.OPENAI_TEMPERATURE,
      0.7
    );

    try {
      const completion = await openai.chat.completions.create(
        {
          model,
          messages: messages as ChatCompletionMessageParam[],
          temperature
        },
        opts.signal ? { signal: opts.signal } : undefined
      );
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('OpenAI returned an empty response');
      return text;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  private async callResponsesAPI(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const openai = await this.createClient();
    const model = this.ctx.config.getConfig<string>(ConfigKeys.OPENAI_MODEL);
    const reasoningEffort = this.ctx.config.getConfig<string>(
      ConfigKeys.OPENAI_REASONING_EFFORT,
      'medium'
    );
    const textVerbosity = this.ctx.config.getConfig<string>(
      ConfigKeys.OPENAI_TEXT_VERBOSITY,
      'medium'
    );

    const verbosityTokenMap: Record<string, number> = {
      low: 1000,
      medium: 4000,
      high: 16000
    };
    const maxOutputTokens = verbosityTokenMap[textVerbosity] ?? 4000;

    const systemMsg = messages.find((m) => m.role === 'system');
    const instructions = systemMsg?.content;

    const inputMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const response = await openai.responses.create(
        {
          model,
          ...(instructions ? { instructions } : {}),
          input: inputMessages,
          reasoning: { effort: reasoningEffort as ReasoningEffort },
          max_output_tokens: maxOutputTokens
        },
        opts.signal ? { signal: opts.signal } : undefined
      );
      const text = response.output_text;
      if (!text) throw new Error('OpenAI Responses API returned an empty response');
      return text;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  async *generateStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const apiType = this.ctx.config.getConfig<string>(
      ConfigKeys.OPENAI_API_TYPE,
      'completion'
    );

    const openai = await this.createClient();
    const model = this.ctx.config.getConfig<string>(ConfigKeys.OPENAI_MODEL);

    if (apiType === 'response') {
      // Responses API: stream via openai.responses.stream
      const reasoningEffort = this.ctx.config.getConfig<string>(
        ConfigKeys.OPENAI_REASONING_EFFORT,
        'medium'
      );
      const systemMsg = messages.find((m) => m.role === 'system');
      const inputMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const stream = await openai.responses.create(
        {
          model,
          ...(systemMsg ? { instructions: systemMsg.content } : {}),
          input: inputMessages,
          reasoning: { effort: reasoningEffort as ReasoningEffort },
          stream: true
        },
        opts.signal ? { signal: opts.signal } : undefined
      );
      for await (const event of stream) {
        const anyEvent = event as { type: string; delta?: string };
        if (anyEvent.type === 'response.output_text.delta' && anyEvent.delta) {
          yield anyEvent.delta;
        }
      }
      return;
    }

    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.OPENAI_TEMPERATURE,
      0.7
    );
    const stream = await openai.chat.completions.create(
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

  private wrapError(err: unknown): Error {
    const status =
      (err as { response?: { status?: number }; status?: number })?.response?.status ??
      (err as { status?: number })?.status;
    if (status) {
      switch (status) {
        case 401:
          return new Error('Invalid OpenAI API key or unauthorized access');
        case 429:
          return new Error('Rate limit exceeded. Please try again later');
        case 500:
          return new Error('OpenAI server error. Please try again later');
        case 503:
          return new Error('OpenAI service is temporarily unavailable');
      }
    }
    if (err instanceof Error) return err;
    return new Error(typeof err === 'string' ? err : 'OpenAI request failed');
  }

  async listModels(): Promise<string[]> {
    const openai = await this.createClient();
    const models = await openai.models.list();
    return models.data.map((m) => m.id);
  }
}
