import OpenAI from 'openai';
import { ConfigKeys, getConfig } from './config';

const apiKey = getConfig<string>(ConfigKeys.OPENAI_API_KEY);
const baseURL = getConfig<string>(ConfigKeys.OPENAI_BASE_URL);
const model = getConfig<string>(ConfigKeys.OPENAI_MODEL);
const apiVersion = getConfig<string>(ConfigKeys.AZURE_API_VERSION);

if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing or empty.');
}

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

export async function ChatGPTAPI(messages) {
  const result = await openai.chat.completions.create({
    model,
    messages
  });
  return result.choices[0]!.message?.content;
}
