import * as vscode from 'vscode';
import { LLMProvider } from 'prompt-compiler-core';

/**
 * LLM provider that uses the VS Code Language Model API.
 *
 * This provider leverages built-in VS Code LM capabilities (e.g., via
 * GitHub Copilot) for zero-configuration prompt compilation. No API key
 * is required — the IDE handles authentication.
 */
export class VSCodeLMProvider implements LLMProvider {
  /** Unique identifier for this provider. */
  readonly id = 'vscode-lm';

  /** Human-readable display name. */
  readonly name = 'VS Code Language Model';

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
  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    const models = await vscode.lm.selectChatModels({});

    if (!models || models.length === 0) {
      throw new Error(
        'No VS Code Language Models available. Please install a model provider extension ' +
        '(e.g., GitHub Copilot) or switch to the openai-compat provider in settings.'
      );
    }

    const model = models[0];

    const messages = [
      vscode.LanguageModelChatMessage.User(
        systemPrompt + '\n\n' + userMessage
      ),
    ];

    const cancellationSource = new vscode.CancellationTokenSource();

    const response = await model.sendRequest(
      messages,
      {},
      cancellationSource.token
    );

    let result = '';
    for await (const chunk of response.text) {
      result += chunk;
    }

    return result;
  }
}
