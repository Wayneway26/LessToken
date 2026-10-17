/**
 * Abstract interface for an LLM provider that can generate text completions.
 *
 * Implementations must supply an `id`, a human-readable `name`, and a
 * `generate` method that accepts a system prompt and user message pair.
 */
export interface LLMProvider {
  /** Unique machine-readable identifier for this provider instance. */
  readonly id: string;
  /** Human-readable display name for this provider. */
  readonly name: string;
  /**
   * Generate a text completion from a system prompt and user message.
   *
   * @param systemPrompt - The system-level instruction for the LLM.
   * @param userMessage - The user-level input message.
   * @returns The generated text response.
   */
  generate(systemPrompt: string, userMessage: string): Promise<string>;
}
