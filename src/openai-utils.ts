import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { ConfigKeys, ConfigurationManager } from './config';
import { type Agent } from 'http';

/**
 * Creates and returns an OpenAI configuration object.
 * @returns {Object} - The OpenAI configuration object.
 * @throws {Error} - Throws an error if the API key is missing or empty.
 */
function getOpenAIConfig() {
  const configManager = ConfigurationManager.getInstance();
  const apiKey = configManager.getConfig<string>(ConfigKeys.OPENAI_API_KEY);
  const baseURL = configManager.getConfig<string>(ConfigKeys.OPENAI_BASE_URL);
  const apiVersion = configManager.getConfig<string>(ConfigKeys.AZURE_API_VERSION);
  const httpAgent = configManager.getProxyAgent();

  if (!apiKey) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty.');
  }

  const config: {
    apiKey: string;
    baseURL?: string;
    httpAgent?: Agent;
    defaultQuery?: { 'api-version': string };
    defaultHeaders?: { 'api-key': string };
  } = {
    apiKey
  };

  if (httpAgent) {
    config.httpAgent = httpAgent;
  }

  if (baseURL) {
    config.baseURL = baseURL;
    if (apiVersion) {
      config.defaultQuery = { 'api-version': apiVersion };
      config.defaultHeaders = { 'api-key': apiKey };
    }
  }

  return config;
}

/**
 * Creates and returns an OpenAI API instance.
 * @returns {OpenAI} - The OpenAI API instance.
 */
export function createOpenAIApi() {
  const config = getOpenAIConfig();
  return new OpenAI(config);
}

/**
 * Sends a chat completion request to the OpenAI API.
 * @param {Array<Object>} messages - The messages to send to the API.
 * @returns {Promise<string>} - A promise that resolves to the API response.
 */
export async function ChatGPTAPI(messages: ChatCompletionMessageParam[]) {
  const openai = createOpenAIApi();
  const model = ConfigurationManager.getInstance().getConfig<string>(
    ConfigKeys.OPENAI_MODEL
  );

  const completion = await openai.chat.completions.create({
    model,
    messages: messages as ChatCompletionMessageParam[]
  });

  return completion.choices[0]!.message?.content;
}
