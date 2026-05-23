import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';
import { ConfigKeys } from '../config';
import type { ChatMessage, GenerateOptions } from '../types/messages';
import { AbstractLLMProvider } from './base';
import type { ProviderId } from './types';

export class GeminiProvider extends AbstractLLMProvider {
  readonly id: ProviderId = 'gemini';
  readonly displayName = 'Gemini';
  readonly apiKeyConfigKey = ConfigKeys.GEMINI_API_KEY;

  private async createModel(messages: ChatMessage[]): Promise<GenerativeModel> {
    const apiKey = await this.resolveApiKey();
    const modelName = this.ctx.config.getConfig<string>(ConfigKeys.GEMINI_MODEL);
    const gemini = new GoogleGenerativeAI(apiKey);

    const systemMessage = messages.find((m) => m.role === 'system');
    return gemini.getGenerativeModel({
      model: modelName,
      ...(systemMessage
        ? {
            systemInstruction: {
              role: 'system',
              parts: [{ text: systemMessage.content }]
            }
          }
        : {})
    });
  }

  /**
   * @google/generative-ai does not honor AbortSignal, so we race the call
   * against an abort promise. This still leaks the underlying request, but
   * surfaces the abort to the caller immediately.
   */
  private withAbort<T>(p: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (!signal) return p;
    if (signal.aborted) return Promise.reject(new Error('Aborted'));
    return new Promise<T>((resolve, reject) => {
      const onAbort = () => reject(new Error('Aborted'));
      signal.addEventListener('abort', onAbort, { once: true });
      p.then(
        (v) => {
          signal.removeEventListener('abort', onAbort);
          resolve(v);
        },
        (e) => {
          signal.removeEventListener('abort', onAbort);
          reject(e);
        }
      );
    });
  }

  protected async doGenerate(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string> {
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.GEMINI_TEMPERATURE,
      0.7
    );

    const model = await this.createModel(messages);
    const userAssistantMessages = messages.filter((m) => m.role !== 'system');

    try {
      const chat = model.startChat({ generationConfig: { temperature } });
      const userContents = userAssistantMessages.map((m) => m.content);
      const result = await this.withAbort(chat.sendMessage(userContents), opts.signal);
      return result.response.text();
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Gemini API error: ${err.message}`, { cause: err });
      }
      throw new Error('Gemini API error: unknown failure', { cause: err });
    }
  }

  async *generateStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const temperature = this.ctx.config.getConfig<number>(
      ConfigKeys.GEMINI_TEMPERATURE,
      0.7
    );
    const model = await this.createModel(messages);
    const userAssistantMessages = messages.filter((m) => m.role !== 'system');
    const userContents = userAssistantMessages.map((m) => m.content);

    const chat = model.startChat({ generationConfig: { temperature } });
    const streamResult = await this.withAbort(
      chat.sendMessageStream(userContents),
      opts.signal
    );

    for await (const chunk of streamResult.stream) {
      if (opts.signal?.aborted) throw new Error('Aborted');
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
