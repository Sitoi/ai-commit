import OpenAI from 'openai';
import { ConfigKeys, getConfig } from './config';

/**
 * Retrieves the OpenAI API key from the configuration.
 * @constant {string} apiKey - The OpenAI API key.
 * @constant {string} baseURL - The base URL for the OpenAI API.
 * @constant {string} model - The model used for OpenAI.
 * @constant {string} apiVersion - The version of the Azure API.
 * @throws {Error} - Throws an error if the API key is missing or empty.
 */
const apiKey = getConfig<string>(ConfigKeys.OPENAI_API_KEY);
const baseURL = getConfig<string>(ConfigKeys.OPENAI_BASE_URL);
const model = getConfig<string>(ConfigKeys.OPENAI_MODEL);
const apiVersion = getConfig<string>(ConfigKeys.AZURE_API_VERSION);

if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing or empty.');
}

/**
 * Configuration object for OpenAI API.
 * @type {Object}
 * @property {string} apiKey - The API key for OpenAI.
 * @property {string} [baseURL] - The base URL for OpenAI API, if provided.
 * @property {Object} [defaultQuery] - Default query parameters for API requests.
 * @property {Object} [defaultHeaders] - Default headers for API requests.
 */
const openaiConfig: {
  apiKey: string;
  baseURL?: string;
  defaultQuery?: { 'api-version': string };
  defaultHeaders?: { 'api-key': string };
} = {
  apiKey
};

if (apiVersion) {
  openaiConfig.defaultQuery = { 'api-version': apiVersion };
  openaiConfig.defaultHeaders = { 'api-key': apiKey };
}
if (baseURL) {
  openaiConfig.baseURL = baseURL;
}
console.log('openaiConfig: ', openaiConfig);
const openai = new OpenAI(openaiConfig);

/**
 * Sends a chat completion request to the OpenAI API.
 * 
 * @param {Array<Object>} messages - An array of
 * @returns {string} - The response from the OpenAI API.
 */
export async function ChatGPTAPI(messages) {
  const result = await openai.chat.completions.create({
    model,
    messages
  });
  return result.choices[0]!.message?.content;
}
