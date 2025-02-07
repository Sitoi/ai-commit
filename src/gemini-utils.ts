import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigKeys, ConfigurationManager } from './config';

/**
 * Creates and returns a Gemini API configuration object.
 * @returns {Object} - The Gemini API configuration object.
 * @throws {Error} - Throws an error if the API key is missing or empty.
 */
function getGeminiConfig() {
  const configManager = ConfigurationManager.getInstance();
  const apiKey = configManager.getConfig<string>(ConfigKeys.GEMINI_API_KEY);

  if (!apiKey) {
    throw new Error('The GEMINI_API_KEY environment variable is missing or empty.');
  }

  const config: {
    apiKey: string;
  } = {
    apiKey
  };

  return config;
}

/**
 * Creates and returns a Gemini API instance.
 * @returns {GoogleGenerativeAI} - The Gemini API instance.
 */
export function createGeminiAPIClient() {
  const config = getGeminiConfig();
  return new GoogleGenerativeAI(config.apiKey);
}

/**
 * Sends a chat completion request to the Gemini API.
 * @param {any[]} messages - The messages to send to the API.
 * @returns {Promise<string>} - A promise that resolves to the API response.
 */
export async function GeminiAPI(messages: any[]) {
  try {
    const gemini = createGeminiAPIClient();
    const configManager = ConfigurationManager.getInstance();
    const modelName = configManager.getConfig<string>(ConfigKeys.GEMINI_MODEL);
    const temperature = configManager.getConfig<number>(ConfigKeys.GEMINI_TEMPERATURE, 0.7);

    const model = gemini.getGenerativeModel({ model: modelName });
    const chat = model.startChat({
      generationConfig: {
        temperature: temperature,
      },
    });

    const result = await chat.sendMessage(messages.map(msg => msg.content));
    const response = result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}