export interface OpenAICompatiblePreset {
  id: string;
  displayName: string;
  baseURL: string;
  recommendedModels: string[];
  homepage: string;
}

export const OPENAI_COMPATIBLE_PRESETS: OpenAICompatiblePreset[] = [
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    recommendedModels: ['deepseek-chat', 'deepseek-reasoner'],
    homepage: 'https://platform.deepseek.com'
  },
  {
    id: 'zhipu',
    displayName: 'Zhipu GLM',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    recommendedModels: ['glm-4-flash', 'glm-4-plus'],
    homepage: 'https://bigmodel.cn'
  },
  {
    id: 'qwen',
    displayName: 'Qwen (DashScope)',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    recommendedModels: ['qwen-plus', 'qwen-max'],
    homepage: 'https://dashscope.console.aliyun.com'
  },
  {
    id: 'groq',
    displayName: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    recommendedModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    homepage: 'https://console.groq.com'
  },
  {
    id: 'openrouter',
    displayName: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    recommendedModels: [
      'anthropic/claude-sonnet-4.5',
      'openai/gpt-5',
      'google/gemini-2.5-pro'
    ],
    homepage: 'https://openrouter.ai'
  }
];
