import { LLMProvider } from 'prompt-compiler-core';
/**
 * LLM provider that uses the VS Code Language Model API.
 *
 * This provider leverages built-in VS Code LM capabilities (e.g., via
 * GitHub Copilot) for zero-configuration prompt compilation. No API key
 * is required — the IDE handles authentication.
 */
export declare class VSCodeLMProvider implements LLMProvider {
    /** Unique identifier for this provider. */
    readonly id = "vscode-lm";
    /** Human-readable display name. */
    readonly name = "VS Code Language Model";
    /**
     * Generates a response using the VS Code Language Model API.
     *
     * Because the VS Code LM API does not expose a dedicated system role,
     * the system prompt and user message are concatenated into a single
     * User message.
     *
     * @param systemPrompt - The system-level instructions for the model.
     * @param userMessage  - The user-level input to compile.
     * @returns The model's response text.
     * @throws Error if no language models are available in the IDE.
     */
    generate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=vscode-lm-provider.d.ts.map