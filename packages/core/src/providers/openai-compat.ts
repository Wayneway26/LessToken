import type { LLMProvider } from './types';

/** Configuration for an OpenAI-compatible API endpoint. */
export interface OpenAICompatConfig {
  /** API key used for Bearer authentication. */
  apiKey: string;
  /** Base URL of the API (e.g. `'https://api.openai.com/v1'`). */
  baseUrl: string;
  /** Model identifier to use (e.g. `'gpt-4o'`). */
  model: string;
}

/**
 * LLM provider implementation that communicates with any OpenAI-compatible
 * `/chat/completions` endpoint.
 *
 * Uses the native `fetch()` API available in Node 18+. Sends non-streaming
 * requests with a low temperature (`0.3`) for deterministic output.
 *
 * @example
 * ```typescript
 * const provider = new OpenAICompatProvider({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   baseUrl: 'https://api.openai.com/v1',
 *   model: 'gpt-4o',
 * });
 *
 * const result = await provider.generate('You are helpful.', 'Hello!');
 * ```
 */
export class OpenAICompatProvider implements LLMProvider {
  /** @inheritdoc */
  readonly id: string;
  /** @inheritdoc */
  readonly name: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: OpenAICompatConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, ''); // strip trailing slashes
    this.model = config.model;
    this.id = `openai-compat:${this.model}`;
    this.name = `OpenAI-Compatible (${this.model})`;
  }

  /**
   * Send a chat completion request to the OpenAI-compatible endpoint.
   *
   * @param systemPrompt - The system-level instruction for the LLM.
   * @param userMessage - The user-level input message.
   * @returns The text content of the first completion choice.
   * @throws {Error} If the HTTP response is non-2xx or the response body is malformed.
   */
  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const body = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      stream: false,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '<unreadable body>');
      throw new Error(
        `OpenAI-compatible API request failed (${response.status} ${response.statusText}): ${errorText}`,
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (content == null) {
      throw new Error(
        'OpenAI-compatible API returned an unexpected response structure: missing choices[0].message.content',
      );
    }

    return content;
  }
}
