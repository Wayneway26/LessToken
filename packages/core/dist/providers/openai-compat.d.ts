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
export declare class OpenAICompatProvider implements LLMProvider {
    /** @inheritdoc */
    readonly id: string;
    /** @inheritdoc */
    readonly name: string;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly model;
    constructor(config: OpenAICompatConfig);
    /**
     * Send a chat completion request to the OpenAI-compatible endpoint.
     *
     * @param systemPrompt - The system-level instruction for the LLM.
     * @param userMessage - The user-level input message.
     * @returns The text content of the first completion choice.
     * @throws {Error} If the HTTP response is non-2xx or the response body is malformed.
     */
    generate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=openai-compat.d.ts.map